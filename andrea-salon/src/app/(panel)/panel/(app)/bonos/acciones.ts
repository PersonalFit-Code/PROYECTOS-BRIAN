"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { codigoDeRaise } from "@/lib/api";
import { requireOwner, requireSesion } from "@/lib/panel/sesion";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizarCodigoBono } from "@/lib/vouchers/code";
import { emitirBono, enviarBono, textoCaducidad } from "@/lib/vouchers/emitir";
import { ERRORES_BONO, estadoVisible, queQueda, type ResumenBono } from "./comun";

/**
 * Bonos desde el panel: vender en el mostrador, canjear, anular y reenviar. Todas empiezan por
 * `requireSesion()` o `requireOwner()` (una Server Action es un endpoint público: el layout no la
 * protege) y validan con zod antes de tocar nada. Los descuentos van por `redeem_voucher`, que
 * bloquea la fila del bono: dos móviles canjeando a la vez no gastan la misma sesión dos veces.
 */
export type Resultado<T = undefined> = { ok: true; datos?: T; mensaje?: string } | { ok: false; error: string };

const CODIGO_MAL = "Ese código no tiene buena pinta: es como AS-7K3M-Q9ZD.";

function traducir(e: { code?: string | null; message: string } | null): string {
  const c = codigoDeRaise(e);
  if (c && ERRORES_BONO[c]) return ERRORES_BONO[c];
  console.error("[panel/bonos]", e?.message);
  return "No se pudo guardar. Prueba otra vez.";
}

function refrescar(code?: string) {
  revalidatePath("/panel/bonos");
  if (code) revalidatePath(`/panel/bonos/${code}`);
}

/* ── Consultar (para el cobro de una cita con bono) ──────── */

/**
 * Qué bono es y qué le queda, sin descontar nada. Lo usa el cobro de la cita para saber si hay que
 * pedir un importe (tarjeta regalo) o basta con una sesión, y para avisar ANTES de cerrar la cita
 * de que el bono está gastado o caducado.
 */
export async function consultarBono(texto: string): Promise<Resultado<ResumenBono>> {
  await requireSesion();
  const code = normalizarCodigoBono(z.string().max(200).catch("").parse(texto));
  if (!code) return { ok: false, error: CODIGO_MAL };
  const { data: b, error } = await getAdminClient()
    .from("vouchers")
    .select("code, name, kind, status, sessions_total, sessions_left, value_cents, balance_cents, expires_at, recipient_name")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    console.error("[panel/bonos] consultar:", error.message);
    return { ok: false, error: "No se pudo comprobar el bono. Prueba otra vez." };
  }
  if (!b) return { ok: false, error: ERRORES_BONO.BONO_NO_EXISTE! };
  const estado = estadoVisible(b.status, b.expires_at, new Date());
  const conAlgo = b.kind === "sessions" ? (b.sessions_left ?? 0) > 0 : (b.balance_cents ?? 0) > 0;
  return {
    ok: true,
    datos: {
      code: b.code,
      nombre: b.name,
      kind: b.kind,
      estado,
      usable: estado === "active" && conAlgo,
      queda: queQueda(b),
      caducidad: textoCaducidad(b.expires_at),
      balanceCents: b.balance_cents,
      paraQuien: b.recipient_name,
    },
  };
}

/* ── Vender en el salón ──────────────────────────────────── */

const Venta = z.object({
  productId: z.uuid("Elige qué bono se lleva."),
  nombre: z.string().trim().min(2, "Escribe el nombre de quien lo compra.").max(80, "El nombre es demasiado largo."),
  email: z.string().trim().max(200).pipe(z.union([z.literal(""), z.email("Ese correo no parece válido.")])),
  paraQuien: z.string().trim().max(80, "El nombre de quien lo recibe es demasiado largo.").default(""),
  mensaje: z.string().trim().max(300, "La dedicatoria es demasiado larga (máximo 300 caracteres).").default(""),
  metodo: z.enum(["card", "cash", "bizum"], { error: "Elige cómo paga." }),
});

/**
 * Venta en el mostrador: el bono y su cobro se crean juntos (`issue_voucher`, una transacción) y el
 * correo sale DESPUÉS de responder (`after`), para no tener a la clienta esperando a Resend. Si no
 * dejó correo, el QR se le enseña en la pantalla de la ficha que se abre a continuación.
 */
export async function venderBono(entrada: z.input<typeof Venta>): Promise<Resultado> {
  const s = await requireSesion();
  const p = Venta.safeParse(entrada);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Revisa los datos." };
  const d = p.data;

  // `issue_voucher` no mira si el producto sigue a la venta: eso es cosa de quien vende.
  const { data: producto } = await getAdminClient().from("voucher_products").select("id, active").eq("id", d.productId).maybeSingle();
  if (!producto?.active) return { ok: false, error: "Ese bono ya no está a la venta. Recarga la página." };

  const r = await emitirBono({
    productId: d.productId,
    compradora: { nombre: d.nombre, email: d.email || null },
    paraQuien: d.paraQuien || null,
    mensaje: d.mensaje || null,
    metodo: d.metodo,
    enSalon: true,
    actor: s.userId,
  });
  if (!r.ok) {
    console.error("[panel/bonos] venta:", r.codigo ?? "", r.error);
    return { ok: false, error: "No se pudo crear el bono. Prueba otra vez." };
  }

  const bono = r.bono;
  if (bono.buyer_email) {
    after(async () => {
      const envio = await enviarBono(bono);
      if (!envio.ok) console.error("[panel/bonos] correo del bono:", envio.error);
    });
  }
  refrescar(bono.code);
  // Fuera de cualquier try: `redirect` lanza a propósito y Next lo convierte en navegación.
  redirect(`/panel/bonos/${bono.code}?nuevo=${bono.buyer_email ? "correo" : "1"}`);
}

/* ── Canjear desde la ficha del bono ─────────────────────── */

const Canje = z.discriminatedUnion("modo", [
  z.object({ modo: z.literal("sesion"), code: z.string().max(40) }),
  z.object({ modo: z.literal("importe"), code: z.string().max(40), importeCents: z.number().int().min(1).max(1_000_000) }),
]);

/**
 * Una sesión (bono de sesiones) o un importe (tarjeta regalo), sin cita asociada: para cuando se
 * usa el bono fuera de una cita del panel. Si es para cobrar una cita, mejor desde la cita, que la
 * cierra en la misma transacción.
 */
export async function canjearBono(entrada: z.input<typeof Canje>): Promise<Resultado> {
  const s = await requireSesion();
  const p = Canje.safeParse(entrada);
  if (!p.success) {
    return { ok: false, error: entrada?.modo === "importe" ? "Escribe un importe mayor que cero, como 12 o 12,50." : "Revisa los datos." };
  }
  const code = normalizarCodigoBono(p.data.code);
  if (!code) return { ok: false, error: CODIGO_MAL };

  const db = getAdminClient();
  const { error } = await db.rpc("redeem_voucher", {
    p_code: code,
    p_sessions: p.data.modo === "sesion" ? 1 : 0,
    p_amount_cents: p.data.modo === "importe" ? p.data.importeCents : 0,
    p_booking: null,
    p_actor: s.userId,
  });
  if (error) return { ok: false, error: traducir(error) };

  const { data: tras } = await db
    .from("vouchers")
    .select("kind, sessions_left, sessions_total, balance_cents, value_cents")
    .eq("code", code)
    .maybeSingle();
  refrescar(code);
  const hecho = p.data.modo === "sesion" ? "Sesión canjeada." : "Importe descontado.";
  return { ok: true, mensaje: tras ? `${hecho} ${queQueda(tras)}.` : hecho };
}

/* ── Solo la dueña: anular y reenviar ────────────────────── */

const Codigo = z.string().max(40);

/**
 * Anular un bono (vendido por error, duplicado…). No se borra: queda en la lista como «Anulado»
 * con su historial. Va con el cliente de la sesión y no con el de servicio para que `audit_log`
 * apunte a la dueña como autora (con la clave de servicio quedaría «service_role»); RLS deja a la
 * dueña y `requireOwner()` ya lo ha comprobado.
 */
export async function anularBono(texto: string): Promise<Resultado> {
  await requireOwner();
  const code = normalizarCodigoBono(Codigo.catch("").parse(texto));
  if (!code) return { ok: false, error: CODIGO_MAL };
  const db = await createClient();
  const { data, error } = await db.from("vouchers").update({ status: "void" }).eq("code", code).eq("status", "active").select("id");
  if (error) {
    console.error("[panel/bonos] anular:", error.message);
    return { ok: false, error: "No se pudo anular el bono. Prueba otra vez." };
  }
  if (!data || data.length === 0) return { ok: false, error: "Este bono ya no estaba activo: no hay nada que anular." };
  refrescar(code);
  return { ok: true, mensaje: "Bono anulado. Ya no se puede usar." };
}

/**
 * Reenviar el correo del bono. `enviarCorreo` deduplica por (bono, canal, tipo), así que un envío
 * nuevo sin más se quedaría en «ya estaba enviado» y no saldría nada: se reutiliza la fila de
 * `notifications` que ya existe, como hace el cron con los reintentos.
 */
export async function reenviarBono(texto: string): Promise<Resultado> {
  await requireOwner();
  const code = normalizarCodigoBono(Codigo.catch("").parse(texto));
  if (!code) return { ok: false, error: CODIGO_MAL };
  const db = getAdminClient();
  const { data: bono } = await db.from("vouchers").select("*").eq("code", code).maybeSingle();
  if (!bono) return { ok: false, error: ERRORES_BONO.BONO_NO_EXISTE! };
  if (!bono.buyer_email) return { ok: false, error: "Este bono no tiene correo: enséñale el QR en pantalla." };

  const { data: previa } = await db
    .from("notifications")
    .select("id")
    .eq("voucher_id", bono.id)
    .eq("channel", "email")
    .eq("kind", "voucher")
    .maybeSingle();
  const r = await enviarBono(bono, { notificacionId: previa?.id });
  if (!r.ok) {
    console.error("[panel/bonos] reenviar:", r.error);
    const sinConfigurar = /RESEND_API_KEY/.test(r.error);
    return { ok: false, error: sinConfigurar ? "El envío de correos aún no está configurado." : "No se pudo enviar el correo. Prueba otra vez." };
  }
  return { ok: true, mensaje: `Correo enviado a ${bono.buyer_email}.` };
}
