/**
 * Consentimiento de cookies — almacenamiento y notificaciones.
 *
 * Estado guardado en `localStorage` bajo la clave `tixola_consent`:
 *   { necessary: true, analytics: boolean, ts: number, v: number }
 *
 * - `getConsent()` devuelve `null` si no hay decisión, si está caducada (> 12 meses) o si el
 *   almacenamiento no está disponible (modo privado, cuota…). En ese caso el banner vuelve a preguntar.
 * - `setConsent()` guarda y emite el evento `tixola:consent` en `window` con el nuevo estado.
 * - `onConsentChange()` suscribe a ese evento (y a `storage`, para cambios en otras pestañas).
 * - `openCookieSettings()` emite `tixola:cookie-settings`: el banner lo escucha y reabre el panel
 *   de preferencias (lo usa el botón "Configurar cookies" del pie y de la política de cookies).
 *
 * Solo funciones puras + acceso al DOM guardado: seguro de importar desde componentes de servidor.
 */
import { CONSENT_MAX_AGE_MONTHS } from "@/data/legal";

export const CONSENT_STORAGE_KEY = "tixola_consent";
export const CONSENT_EVENT = "tixola:consent";
export const COOKIE_SETTINGS_EVENT = "tixola:cookie-settings";

/** Súbelo si cambia la forma del objeto o las categorías: las decisiones antiguas se descartan. */
export const CONSENT_VERSION = 1;

export interface ConsentState {
  /** Las cookies técnicas no se pueden rechazar (art. 22.2 LSSI-CE). */
  necessary: true;
  analytics: boolean;
  /** Fecha de la decisión (ms desde epoch). */
  ts: number;
  /** Versión del esquema. */
  v: number;
}

/** Categorías que el usuario puede activar o desactivar. */
export type ConsentChoices = Pick<ConsentState, "analytics">;

/* Eventos tipados: `window.addEventListener("tixola:consent", (e) => e.detail.analytics)` compila sin casts. */
declare global {
  interface WindowEventMap {
    "tixola:consent": CustomEvent<ConsentState>;
    "tixola:cookie-settings": Event;
  }
}

const MAX_AGE_MS = CONSENT_MAX_AGE_MONTHS * 30.44 * 24 * 60 * 60 * 1000;

function isConsentState(value: unknown): value is ConsentState {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return c.necessary === true && typeof c.analytics === "boolean" && typeof c.ts === "number" && typeof c.v === "number";
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Decisión vigente o `null` (sin decisión, caducada, versión antigua o almacenamiento bloqueado). */
export function getConsent(now = Date.now()): ConsentState | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isConsentState(parsed) || parsed.v !== CONSENT_VERSION) return null;
    if (now - parsed.ts > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Guarda la decisión y avisa a quien escuche (`tixola:consent`). Devuelve el estado guardado. */
export function setConsent(choices: ConsentChoices, now = Date.now()): ConsentState {
  const state: ConsentState = { necessary: true, analytics: choices.analytics, ts: now, v: CONSENT_VERSION };
  const store = storage();
  if (store) {
    try {
      store.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* cuota llena o modo privado: la decisión vive solo en esta página */
    }
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_EVENT, { detail: state }));
  return state;
}

/** Borra la decisión (el banner volverá a aparecer en la próxima carga). */
export function clearConsent(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* nada que borrar */
  }
}

/** `true` si el usuario ha aceptado la analítica (y la decisión sigue vigente). */
export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}

/**
 * Suscripción a cambios de consentimiento: en esta pestaña (evento propio) y en otras
 * (evento `storage`). Devuelve la función para cancelar la suscripción.
 */
export function onConsentChange(listener: (state: ConsentState | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onEvent = (e: CustomEvent<ConsentState>) => listener(e.detail);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === CONSENT_STORAGE_KEY) listener(getConsent());
  };
  window.addEventListener(CONSENT_EVENT, onEvent);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onEvent);
    window.removeEventListener("storage", onStorage);
  };
}

/** Pide al banner que se muestre con el panel de preferencias abierto. */
export function openCookieSettings(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}
