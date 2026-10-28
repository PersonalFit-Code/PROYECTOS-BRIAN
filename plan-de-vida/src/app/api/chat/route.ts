/**
 * POST /api/chat — una vuelta de conversación con el coach.
 * Cuerpo: { mensaje: string }. Respuesta: { texto, acciones, modo }.
 * DELETE /api/chat — borra el historial.
 *
 * Solo con sesión (401 si no). Se rechazan peticiones de otros orígenes: cada mensaje con IA cuesta.
 */
import { z } from "zod";
import { conversar } from "@/lib/coach/conversar";
import { getSesionApi } from "@/lib/sesion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Cuerpo = z.object({ mensaje: z.string().trim().min(1).max(4000) });

function mismoOrigen(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request): Promise<Response> {
  if (!mismoOrigen(req)) return Response.json({ error: "Origen no permitido" }, { status: 403 });
  const s = await getSesionApi();
  if (!s) return Response.json({ error: "Inicia sesión" }, { status: 401 });
  const lectura = Cuerpo.safeParse(await req.json().catch(() => null));
  if (!lectura.success) return Response.json({ error: "Mensaje vacío o demasiado largo" }, { status: 400 });
  const respuesta = await conversar(s, lectura.data.mensaje);
  return Response.json(respuesta, { headers: { "cache-control": "no-store" } });
}

export async function DELETE(req: Request): Promise<Response> {
  if (!mismoOrigen(req)) return Response.json({ error: "Origen no permitido" }, { status: 403 });
  const s = await getSesionApi();
  if (!s) return Response.json({ error: "Inicia sesión" }, { status: 401 });
  await s.db.from("chat_messages").delete().eq("user_id", s.userId);
  return Response.json({ ok: true });
}
