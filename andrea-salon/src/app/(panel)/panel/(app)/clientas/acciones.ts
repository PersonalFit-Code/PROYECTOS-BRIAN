"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner, requireSesion } from "@/lib/panel/sesion";
import { normalizarTelefonoES } from "@/lib/phone";
import { getAdminClient } from "@/lib/supabase/admin";

export type Resultado = { ok: true; mensaje: string } | { ok: false; error: string };

const Ficha = z.object({
  id: z.uuid(),
  nombre: z.string().trim().min(2).max(80),
  telefono: z.string().trim().max(24).default(""),
  email: z.union([z.email(), z.literal("")]).default(""),
  notas: z.string().trim().max(1000).default(""),
  marketing: z.boolean(),
  whatsapp: z.boolean(),
});

/** Editar la ficha. Las notas son las alergias y preferencias: las ve todo el equipo, a propósito. */
export async function guardarFicha(entrada: z.input<typeof Ficha>): Promise<Resultado> {
  await requireSesion();
  const p = Ficha.safeParse(entrada);
  if (!p.success) return { ok: false, error: "Revisa el nombre y el correo." };
  const d = p.data;
  const telefono = d.telefono ? normalizarTelefonoES(d.telefono) : null;
  if (d.telefono && !telefono) return { ok: false, error: "Ese teléfono no parece español." };

  const db = getAdminClient();
  const { data: antes } = await db.from("clients").select("marketing_consent, marketing_consent_at").eq("id", d.id).maybeSingle();
  if (!antes) return { ok: false, error: "La clienta no existe." };
  const { error } = await db
    .from("clients")
    .update({
      name: d.nombre,
      phone: telefono,
      email: d.email || null,
      notes: d.notas || null,
      marketing_consent: d.marketing,
      // Fecha del consentimiento: la primera vez que se marca. Al retirarlo se borra.
      marketing_consent_at: d.marketing ? (antes.marketing_consent_at ?? new Date().toISOString()) : null,
      whatsapp_consent: d.whatsapp,
    })
    .eq("id", d.id);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ya hay otra clienta con ese teléfono." };
    return { ok: false, error: "No se pudo guardar." };
  }
  revalidatePath(`/panel/clientas/${d.id}`);
  return { ok: true, mensaje: "Ficha guardada." };
}

/**
 * Derecho de supresión (RGPD art. 17): se borran los datos personales pero se conservan las citas
 * y los cobros (anónimos), que el salón necesita para sus cuentas. No se puede deshacer.
 */
export async function anonimizar(id: string): Promise<Resultado> {
  await requireOwner();
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Clienta no válida." };
  const { error } = await getAdminClient()
    .from("clients")
    .update({
      name: "Clienta anonimizada",
      phone: null,
      email: null,
      notes: null,
      marketing_consent: false,
      marketing_consent_at: null,
      whatsapp_consent: false,
      anonymized_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo anonimizar." };
  revalidatePath("/panel/clientas");
  revalidatePath(`/panel/clientas/${id}`);
  return { ok: true, mensaje: "Datos personales borrados. Su historial queda sin nombre." };
}
