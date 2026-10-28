/**
 * POST /api/push — guarda la suscripción push de este dispositivo. DELETE — la borra.
 * Cuerpo: la suscripción tal como la da el navegador (PushSubscription.toJSON()).
 */
import { z } from "zod";
import { getSesionApi } from "@/lib/sesion";

export const dynamic = "force-dynamic";

const Suscripcion = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(200) }),
});

export async function POST(req: Request): Promise<Response> {
  const s = await getSesionApi();
  if (!s) return Response.json({ error: "Inicia sesión" }, { status: 401 });
  const lectura = Suscripcion.safeParse(await req.json().catch(() => null));
  if (!lectura.success) return Response.json({ error: "Suscripción no válida" }, { status: 400 });
  const { endpoint, keys } = lectura.data;
  const r = await s.db.from("push_subscriptions").upsert({ user_id: s.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: "endpoint" });
  if (r.error) return Response.json({ error: r.error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request): Promise<Response> {
  const s = await getSesionApi();
  if (!s) return Response.json({ error: "Inicia sesión" }, { status: 401 });
  const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (endpoint) await s.db.from("push_subscriptions").delete().eq("user_id", s.userId).eq("endpoint", endpoint);
  return Response.json({ ok: true });
}
