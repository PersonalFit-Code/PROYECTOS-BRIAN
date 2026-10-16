/*
 * Consentimiento de cookies (LSSI-CE art. 22.2 y guía de cookies de la AEPD, 2023).
 *
 * Regla de la casa: NADA que instale cookies de terceros se carga antes de que la persona elija. Hoy
 * lo único que las instala es el mapa de Google; el pago de los bonos va en la página alojada de
 * Stripe (no mete nada en la nuestra) y los correos no son cookies. Si mañana entra analítica u otro
 * servicio, se añade aquí como categoría nueva y se sube `VERSION` para volver a preguntar.
 *
 * La elección se guarda en localStorage («as-consent»), que es técnico y está exento: no sale del
 * dispositivo y sirve justo para respetar lo que se ha decidido. Caduca al año (`CONSENT_MAX_AGE_MONTHS`
 * en data/legal.ts; la AEPD admite hasta 24). Si el navegador no deja guardar (modo privado, datos
 * bloqueados), la elección vale para esta visita y se vuelve a preguntar en la siguiente.
 */
import { CONSENT_MAX_AGE_MONTHS } from "@/data/legal";

export interface Consent {
  v: number;
  /* ISO de cuándo se eligió. */
  date: string;
  /* Google Maps: el mapa de «Cómo llegar» de contacto y del pie. */
  maps: boolean;
}

const KEY = "as-consent";
const CHANGE = "as:consent-change";
const OPEN = "as:consent-open";
const VERSION = 1;
/* Meses → milisegundos, con meses de 30 días: la precisión al día no importa, el orden sí. */
const MAX_AGE_MS = CONSENT_MAX_AGE_MONTHS * 30 * 24 * 60 * 60 * 1000;

/* useSyncExternalStore pide la MISMA referencia mientras no cambie nada: se cachea por texto. */
let cache: { raw: string | null; value: Consent | null } = { raw: null, value: null };
let memory: Consent | null = null;

function parse(raw: string): Consent | null {
  try {
    const c = JSON.parse(raw) as Partial<Consent>;
    if (c.v !== VERSION || typeof c.maps !== "boolean" || typeof c.date !== "string") return null;
    const age = Date.now() - Date.parse(c.date);
    if (!(age >= 0 && age < MAX_AGE_MS)) return null;
    return { v: c.v, date: c.date, maps: c.maps };
  } catch {
    return null;
  }
}

/** La elección vigente, o `null` si todavía no se ha elegido (o ha caducado). */
export function readConsent(): Consent | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return memory;
  }
  if (raw === null) return memory;
  if (raw !== cache.raw) cache = { raw, value: parse(raw) };
  return cache.value;
}

export function saveConsent(choice: { maps: boolean }) {
  const value: Consent = { v: VERSION, date: new Date().toISOString(), maps: choice.maps };
  memory = value;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* sin almacenamiento: vale `memory` para esta visita */
  }
  window.dispatchEvent(new Event(CHANGE));
}

export function subscribeConsent(cb: () => void) {
  window.addEventListener(CHANGE, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Vuelve a abrir el panel para cambiar la elección («Configurar cookies»). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN));
}

export function onConsentSettingsRequest(cb: () => void) {
  window.addEventListener(OPEN, cb);
  return () => window.removeEventListener(OPEN, cb);
}
