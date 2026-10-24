import { readStorage, writeStorage } from "@/lib/storage";

/*
 * Consentimiento de cookies de terceros. La web solo guarda cosas técnicas (tema, borrador del
 * taco, esta misma elección), que no necesitan permiso. Lo único que instala cookies de terceros
 * es el mapa de Google de /contacto, así que el permiso solo decide si ese mapa se carga.
 * Si un día se añade analítica o vídeo, subir VERSION para volver a preguntar.
 */
const KEY = "bh_cookie_consent";
const VERSION = 1;
const EVENT = "bh-consent-change";

export type ConsentValue = "accepted" | "rejected" | null;

export function getConsent(): ConsentValue {
  const raw = readStorage(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { v?: number; value?: ConsentValue };
    return parsed.v === VERSION ? (parsed.value ?? null) : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Exclude<ConsentValue, null>): void {
  writeStorage(KEY, JSON.stringify({ v: VERSION, value, at: new Date().toISOString() }));
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeConsent(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
