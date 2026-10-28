import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import webpush from "web-push";

/** Notificaciones push (Web Push con claves VAPID). Sin claves configuradas, no hace nada. */
export function pushConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let listo = false;
function configurar() {
  if (listo) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  listo = true;
}

export async function enviarPush(db: SupabaseClient, userId: string, aviso: { title: string; body: string; url?: string }): Promise<number> {
  if (!pushConfigurado()) return 0;
  configurar();
  const { data: subs } = await db.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", userId);
  let enviados = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(aviso), { TTL: 60 * 60 * 12 });
      enviados++;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      // 404/410: el navegador dio de baja la suscripción → borrarla
      if (status === 404 || status === 410) await db.from("push_subscriptions").delete().eq("id", s.id);
      else console.error("[push]", status, err instanceof Error ? err.message : err);
    }
  }
  return enviados;
}
