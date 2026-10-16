import "server-only";

/**
 * CAPTCHA invisible de Cloudflare (Turnstile) al confirmar una reserva: para a los bots que llenan
 * la agenda de citas falsas. Gratis, sin cookies y casi siempre sin que la clienta tenga que hacer
 * nada (solo si Cloudflare duda, enseña una casilla).
 *
 * Se enciende solo: con `TURNSTILE_SECRET_KEY` (servidor) y `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
 * (navegador) puestas en Vercel. Sin ellas no se comprueba nada y la reserva funciona igual.
 *
 * Si Cloudflare no contesta (caída, red), se deja pasar y se apunta en el registro: siguen la cuota
 * por IP y el tope de tres citas por teléfono, y es mejor eso que no dejar reservar a nadie.
 */
const URL_VERIFICAR = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileActivo(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verificarTurnstile(token: string | undefined, ip: string | null): Promise<boolean> {
  const secreto = process.env.TURNSTILE_SECRET_KEY;
  if (!secreto) return true;
  if (!token) return false;
  try {
    const cuerpo = new URLSearchParams({ secret: secreto, response: token });
    if (ip) cuerpo.set("remoteip", ip);
    const res = await fetch(URL_VERIFICAR, { method: "POST", body: cuerpo, signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      console.error("[turnstile] respuesta", res.status);
      return true;
    }
    const datos = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!datos.success) console.warn("[turnstile] rechazado:", datos["error-codes"]?.join(", "));
    return datos.success === true;
  } catch (e) {
    console.error("[turnstile] sin respuesta, se deja pasar:", e);
    return true;
  }
}
