import { z } from "zod";
import { error, leerQuery } from "@/lib/api";
import { limites } from "@/lib/analytics/calcular";
import { aCsv } from "@/lib/csv";
import { fechaLocalISO, hora, ZONA_SALON } from "@/lib/fechas";
import { getSesion } from "@/lib/panel/sesion";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/panel/exportar?tipo=cobros|citas|clientas&desde=YYYY-MM-DD&dias=N[&notas=1]
 *
 * CSV para la gestoría o para Excel (separador `;`, coma decimal, BOM para que Excel lea las
 * tildes). Solo la dueña. Las NOTAS de las clientas (alergias, salud) no salen nunca salvo que se
 * pida expresamente con la casilla: es el dato más delicado que hay aquí (RGPD art. 9).
 */
export const dynamic = "force-dynamic";

const Query = z.object({
  tipo: z.enum(["cobros", "citas", "clientas"]),
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dias: z.coerce.number().int().min(1).max(800).optional(),
  notas: z.enum(["0", "1"]).optional(),
});

const METODO: Record<string, string> = { card: "Tarjeta", cash: "Efectivo", bizum: "Bizum", voucher: "Bono", stripe: "Online" };
const TIPO: Record<string, string> = { booking: "Cita", voucher_sale: "Venta de bono", refund: "Devolución" };
const ESTADO: Record<string, string> = { confirmed: "Confirmada", done: "Hecha", cancelled: "Cancelada", no_show: "No vino", hold: "En curso" };

const euros = (c: number | null | undefined) => (c === null || c === undefined ? null : c / 100);

function respuestaCsv(nombre: string, contenido: string): Response {
  return new Response(contenido, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${nombre}"`,
      "cache-control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  const s = await getSesion();
  if (!s) return error(401, "NO_AUTORIZADO");
  if (s.role !== "owner") return error(403, "NO_AUTORIZADO");

  const lectura = leerQuery(new URL(req.url), Query);
  if (!lectura.ok) return lectura.respuesta;
  const q = lectura.datos;
  const desde = q.desde ?? fechaLocalISO(new Date(Date.now() - 30 * 86_400_000));
  const dias = q.dias ?? 30;
  const rango = limites({ desde, dias }, ZONA_SALON);
  const db = getAdminClient();
  const sufijo = `${desde}_${dias}d`;

  try {
    if (q.tipo === "cobros") {
      const { data, error: e } = await db
        .from("payments")
        .select("paid_at, kind, method, amount_cents, tip_cents, note, bookings(staff(name), clients(name)), vouchers(code)")
        .gte("paid_at", rango.desde.toISOString())
        .lt("paid_at", rango.hasta.toISOString())
        .order("paid_at");
      if (e) throw new Error(e.message);
      const filas = (data ?? []).map((p) => {
        const b = p.bookings as { staff: { name: string } | null; clients: { name: string } | null } | null;
        return {
          fecha: fechaLocalISO(p.paid_at),
          hora: hora(p.paid_at),
          tipo: TIPO[p.kind] ?? p.kind,
          metodo: METODO[p.method] ?? p.method,
          importe: (p.kind === "refund" ? -1 : 1) * (euros(p.amount_cents) ?? 0),
          propina: euros(p.tip_cents),
          profesional: b?.staff?.name ?? "",
          clienta: b?.clients?.name ?? "",
          bono: (p.vouchers as { code: string } | null)?.code ?? "",
          nota: p.note ?? "",
        };
      });
      return respuestaCsv(
        `cobros_${sufijo}.csv`,
        aCsv(filas, [
          { clave: "fecha", cabecera: "Fecha" },
          { clave: "hora", cabecera: "Hora" },
          { clave: "tipo", cabecera: "Tipo" },
          { clave: "metodo", cabecera: "Método" },
          { clave: "importe", cabecera: "Importe (€)" },
          { clave: "propina", cabecera: "Propina (€)" },
          { clave: "profesional", cabecera: "Profesional" },
          { clave: "clienta", cabecera: "Clienta" },
          { clave: "bono", cabecera: "Bono" },
          { clave: "nota", cabecera: "Nota" },
        ]),
      );
    }

    if (q.tipo === "citas") {
      const { data, error: e } = await db
        .from("bookings")
        .select("starts_at, status, source, total_cents, staff(name), clients(name, phone), booking_items(name, position)")
        .neq("status", "hold")
        .gte("starts_at", rango.desde.toISOString())
        .lt("starts_at", rango.hasta.toISOString())
        .order("starts_at");
      if (e) throw new Error(e.message);
      const filas = (data ?? []).map((b) => {
        const items = [...((b.booking_items as { name: string; position: number }[] | null) ?? [])].sort((x, y) => x.position - y.position);
        const cl = b.clients as { name: string; phone: string | null } | null;
        return {
          fecha: fechaLocalISO(b.starts_at),
          hora: hora(b.starts_at),
          estado: ESTADO[b.status] ?? b.status,
          servicios: items.map((i) => i.name).join(" + "),
          profesional: (b.staff as { name: string } | null)?.name ?? "",
          clienta: cl?.name ?? "",
          telefono: cl?.phone ?? "",
          importe: euros(b.total_cents),
          origen: b.source,
        };
      });
      return respuestaCsv(
        `citas_${sufijo}.csv`,
        aCsv(filas, [
          { clave: "fecha", cabecera: "Fecha" },
          { clave: "hora", cabecera: "Hora" },
          { clave: "estado", cabecera: "Estado" },
          { clave: "servicios", cabecera: "Servicios" },
          { clave: "profesional", cabecera: "Profesional" },
          { clave: "clienta", cabecera: "Clienta" },
          { clave: "telefono", cabecera: "Teléfono" },
          { clave: "importe", cabecera: "Importe (€)" },
          { clave: "origen", cabecera: "Origen" },
        ]),
      );
    }

    // clientas: todas (no dependen del periodo), sin anonimizadas.
    const conNotas = q.notas === "1";
    const { data, error: e } = await db
      .from("v_clients")
      .select("name, phone, email, visits, last_visit_at, spent_cents, marketing_consent, notes, created_at")
      .is("anonymized_at", null)
      .order("name");
    if (e) throw new Error(e.message);
    const filas = (data ?? []).map((c) => ({
      nombre: c.name,
      telefono: c.phone ?? "",
      email: c.email ?? "",
      visitas: c.visits,
      ultima: c.last_visit_at ? fechaLocalISO(c.last_visit_at) : "",
      gastado: euros(c.spent_cents),
      publicidad: c.marketing_consent ? "Sí" : "No",
      alta: fechaLocalISO(c.created_at),
      notas: conNotas ? (c.notes ?? "") : "",
    }));
    return respuestaCsv(
      `clientas_${fechaLocalISO(new Date())}.csv`,
      aCsv(filas, [
        { clave: "nombre", cabecera: "Nombre" },
        { clave: "telefono", cabecera: "Teléfono" },
        { clave: "email", cabecera: "Correo" },
        { clave: "visitas", cabecera: "Visitas" },
        { clave: "ultima", cabecera: "Última visita" },
        { clave: "gastado", cabecera: "Gastado (€)" },
        { clave: "publicidad", cabecera: "Acepta publicidad" },
        { clave: "alta", cabecera: "Alta" },
        ...(conNotas ? [{ clave: "notas" as const, cabecera: "Notas" }] : []),
      ]),
    );
  } catch (e) {
    console.error("[exportar]", e);
    return error(500, "ERROR_INTERNO");
  }
}
