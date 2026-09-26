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

/* Eventos tipados: `window.addEventListener("tixola:consent", (e) => e.detail?.analytics)` compila sin casts. */
declare global {
  interface WindowEventMap {
    /** `detail` es la nueva decisión, o `null` tras `clearConsent()`. */
    "tixola:consent": CustomEvent<ConsentState | null>;
    "tixola:cookie-settings": Event;
  }
}

const MAX_AGE_MS = CONSENT_MAX_AGE_MONTHS * 30.44 * 24 * 60 * 60 * 1000;

/* Respaldo en memoria: si localStorage está bloqueado (modo privado, cuota) la decisión vive en esta página. */
let memoryRaw: string | null = null;

/* Caché de la instantánea (useSyncExternalStore exige el mismo objeto mientras nada cambie). */
let cachedRaw: string | null | undefined;
let cachedState: ConsentState | null = null;

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

/** Texto guardado (o el respaldo en memoria si el almacenamiento no está disponible). */
function readRaw(): string | null {
  const store = storage();
  if (!store) return memoryRaw;
  try {
    return store.getItem(CONSENT_STORAGE_KEY) ?? memoryRaw;
  } catch {
    return memoryRaw;
  }
}

/** Valida y descarta decisiones caducadas o de otra versión del esquema. */
function parseConsent(raw: string | null, now: number): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isConsentState(parsed) || parsed.v !== CONSENT_VERSION) return null;
    if (now - parsed.ts > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Decisión vigente o `null` (sin decisión, caducada, versión antigua o almacenamiento bloqueado). */
export function getConsent(now = Date.now()): ConsentState | null {
  return parseConsent(readRaw(), now);
}

/**
 * Instantánea estable para `useSyncExternalStore`: devuelve el mismo objeto mientras no cambie
 * lo guardado. Úsala junto con `subscribeConsent` y `getServerConsentSnapshot`.
 */
export function getConsentSnapshot(): ConsentState | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parseConsent(raw, Date.now());
  }
  return cachedState;
}

/** En el servidor (y durante la hidratación) aún no sabemos nada: `undefined` ≠ "sin decisión". */
export function getServerConsentSnapshot(): undefined {
  return undefined;
}

/** Guarda la decisión y avisa a quien escuche (`tixola:consent`). Devuelve el estado guardado. */
export function setConsent(choices: ConsentChoices, now = Date.now()): ConsentState {
  const state: ConsentState = { necessary: true, analytics: choices.analytics, ts: now, v: CONSENT_VERSION };
  const raw = JSON.stringify(state);
  memoryRaw = raw;
  const store = storage();
  if (store) {
    try {
      store.setItem(CONSENT_STORAGE_KEY, raw);
    } catch {
      /* cuota llena o modo privado: queda el respaldo en memoria */
    }
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_EVENT, { detail: state }));
  return state;
}

/** Borra la decisión (el banner volverá a aparecer) y avisa a quien escuche. */
export function clearConsent(): void {
  memoryRaw = null;
  const store = storage();
  if (store) {
    try {
      store.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      /* nada que borrar */
    }
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<ConsentState | null>(CONSENT_EVENT, { detail: null }));
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
  const onEvent = (e: CustomEvent<ConsentState | null>) => listener(e.detail);
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

/** Suscripción con la firma que espera `useSyncExternalStore`. */
export function subscribeConsent(onStoreChange: () => void): () => void {
  return onConsentChange(onStoreChange);
}

/** Pide al banner que se muestre con el panel de preferencias abierto. */
export function openCookieSettings(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}

/* ──────────────────────────────────────────────────────────────
   Visibilidad del aviso (para apartar los botones flotantes)
   ────────────────────────────────────────────────────────────── */

/**
 * El aviso ocupa todo el ancho y ~350 px de alto en móvil, justo encima de la barra fija: taparía
 * por completo el botón de WhatsApp y el lanzador del camarero virtual hasta que el visitante
 * decida. `CookieConsent` publica aquí su estado y esos botones se apartan mientras esté abierto.
 */
let bannerOpen = false;
const bannerListeners = new Set<() => void>();

export function setCookieBannerOpen(open: boolean): void {
  if (bannerOpen === open) return;
  bannerOpen = open;
  for (const listener of bannerListeners) listener();
}

export function subscribeCookieBanner(onStoreChange: () => void): () => void {
  bannerListeners.add(onStoreChange);
  return () => {
    bannerListeners.delete(onStoreChange);
  };
}

export const getCookieBannerSnapshot = (): boolean => bannerOpen;
/** En el servidor el aviso nunca está pintado todavía. */
export const getServerCookieBannerSnapshot = (): boolean => false;
