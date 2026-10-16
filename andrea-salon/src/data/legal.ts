/**
 * MÓDULO LEGAL — constantes y tipos.
 *
 * Aquí vive únicamente lo que NO se traduce: la fecha de revisión, los datos del titular (que salen
 * de `BUSINESS.legal` y se marcan pendientes mientras falten), la lista de encargados del
 * tratamiento y la forma (tipos) del contenido estructurado. El TEXTO de los tres documentos está en
 * `src/i18n/messages/<idioma>/legal.ts`, así cada idioma puede traducirlo.
 */
import { BUSINESS } from "./business";

/* ──────────────────────────────────────────────────────────────
   Documentos
   ────────────────────────────────────────────────────────────── */

/** Claves de los tres documentos legales (coinciden con `m.legal.docs.*`). */
export const LEGAL_DOC_KEYS = ["privacy", "legalNotice", "cookies"] as const;
export type LegalDocKey = (typeof LEGAL_DOC_KEYS)[number];

export function isLegalDocKey(value: string): value is LegalDocKey {
  return (LEGAL_DOC_KEYS as readonly string[]).includes(value);
}

/**
 * Fecha ISO (AAAA-MM-DD) de la última revisión de los textos legales.
 * Actualízala cada vez que cambie cualquiera de los tres documentos.
 */
export const LEGAL_UPDATED_AT = "2026-10-15";

/** Vigencia del consentimiento de cookies (la AEPD recomienda no superar los 24 meses). */
export const CONSENT_MAX_AGE_MONTHS = 12;

/**
 * Marcador con el que se rellena un dato del titular que todavía no está. Va entre corchetes y en
 * mayúsculas para que `PLACEHOLDER_PATTERN` lo encuentre y `LegalArticle` lo resalte: nadie debe
 * poder leer el aviso legal sin ver que falta algo.
 */
const PENDING = {
  nif: "[NIF PENDIENTE]",
  registeredOffice: "[DOMICILIO PENDIENTE]",
  email: "[CORREO PENDIENTE]",
} as const;

/**
 * Datos del responsable del tratamiento, con marcadores donde falten. Salen de `BUSINESS.legal`,
 * que es el único sitio donde se rellenan: el día que Andrea mande el NIF, el domicilio y el
 * correo, se escriben allí y esto —y el `noindex` de las páginas legales— se actualiza solo.
 */
export const LEGAL_PLACEHOLDERS = {
  /** Titular del negocio. Persona física (empresaria individual), no una sociedad. */
  companyName: BUSINESS.legal.holder ?? "[TITULAR PENDIENTE]",
  nif: BUSINESS.legal.taxId ?? PENDING.nif,
  registeredOffice: BUSINESS.legal.fiscalAddress ?? PENDING.registeredOffice,
  email: BUSINESS.legal.email ?? PENDING.email,
} as const;

export type LegalPlaceholderKey = keyof typeof LEGAL_PLACEHOLDERS;

/**
 * Detecta marcadores "[ASÍ, EN MAYÚSCULAS]" que aún no se han sustituido. Se usa para resaltarlos
 * en `LegalArticle`. Global (g) para `String.prototype.split` con captura.
 */
export const PLACEHOLDER_PATTERN = /(\[[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 ,./-]*\])/g;

/**
 * `true` mientras quede algún dato del titular sin rellenar. En ese estado el aviso legal NO
 * contiene los datos identificativos que exige el art. 10 LSSI-CE y la política de privacidad no
 * ofrece un canal escrito para ejercer los derechos del RGPD, así que las tres páginas se publican
 * con `noindex` y quedan fuera del sitemap. En cuanto Andrea confirme los datos y desaparezcan los
 * corchetes, vuelven a indexarse solas.
 */
export const LEGAL_IDENTITY_PENDING: boolean = Object.values(LEGAL_PLACEHOLDERS).some(
  (value) => value.startsWith("[") && value.endsWith("]"),
);

/* ──────────────────────────────────────────────────────────────
   Encargados del tratamiento (art. 28 RGPD)
   ────────────────────────────────────────────────────────────── */

export interface Subprocessor {
  id: string;
  name: string;
  /** Para qué se usa, en una línea (va al texto legal como `{...}` no: se enlaza por id). */
  role: string;
  /** Dónde trata los datos. */
  location: string;
  /** Garantía de la transferencia internacional, si la hay. */
  safeguard: string | null;
  privacyUrl: string;
  /** `false` mientras la pieza que lo usa no esté en producción (bonos, chat). */
  active: boolean;
}

/**
 * Quién trata datos POR CUENTA del salón. Cada uno tiene que aparecer en la política de privacidad
 * y, antes del lanzamiento, un contrato de encargado firmado (modelo AEPD) o aceptadas sus
 * condiciones de tratamiento de datos (DPA). Supabase está en la UE (Fráncfort) a propósito: la
 * base de datos con nombres, teléfonos y notas de alergias no sale de Europa.
 */
export const SUBPROCESSORS: readonly Subprocessor[] = [
  {
    id: "vercel",
    name: "Vercel Inc.",
    role: "Alojamiento y entrega de la web",
    location: "Estados Unidos (red global)",
    safeguard: "Marco de Privacidad de Datos UE-EE. UU. y cláusulas contractuales tipo",
    privacyUrl: "https://vercel.com/legal/privacy-policy",
    active: true,
  },
  {
    id: "supabase",
    name: "Supabase Inc.",
    role: "Base de datos de citas, clientas y bonos",
    location: "Unión Europea (Fráncfort, Alemania)",
    safeguard: null,
    privacyUrl: "https://supabase.com/privacy",
    active: true,
  },
  {
    id: "stripe",
    name: "Stripe Payments Europe, Ltd.",
    role: "Cobro de bonos y tarjetas regalo",
    location: "Irlanda (Unión Europea)",
    safeguard: "Cláusulas contractuales tipo para los tratamientos fuera de la UE",
    privacyUrl: "https://stripe.com/es/privacy",
    active: false,
  },
  {
    id: "resend",
    name: "Resend, Inc.",
    role: "Envío de confirmaciones y recordatorios por correo",
    location: "Estados Unidos",
    safeguard: "Cláusulas contractuales tipo",
    privacyUrl: "https://resend.com/legal/privacy-policy",
    active: true,
  },
  {
    id: "cloudflare",
    name: "Cloudflare, Inc.",
    role: "Comprobación antirrobots al reservar (Turnstile, sin cookies)",
    location: "Estados Unidos (red global)",
    safeguard: "Marco de Privacidad de Datos UE-EE. UU. y cláusulas contractuales tipo",
    privacyUrl: "https://www.cloudflare.com/es-es/privacypolicy/",
    // Activo en cuanto se configura la clave del CAPTCHA en Vercel.
    active: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  },
  {
    id: "anthropic",
    name: "Anthropic PBC",
    role: "Respuestas del asistente de preguntas frecuentes",
    location: "Estados Unidos",
    safeguard: "Marco de Privacidad de Datos UE-EE. UU. y cláusulas contractuales tipo",
    privacyUrl: "https://www.anthropic.com/legal/privacy",
    active: false,
  },
];

/* ──────────────────────────────────────────────────────────────
   Contenido estructurado (forma de m.legal.docs.*)
   ────────────────────────────────────────────────────────────── */

/**
 * Bloques que sabe pintar `LegalArticle`. Los textos admiten:
 *  - marcadores `{clave}` (responsable, dirección, teléfono, fecha…) → `useFormat()`;
 *  - enlaces `[texto](destino)` donde destino es `privacy` | `legalNotice` | `cookies` |
 *    `home` | `servicios` | `bonos` | `reservar` | una URL http(s) | `mailto:` | `tel:`;
 *  - énfasis `**texto**`.
 */
export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: readonly string[] }
  | { type: "ol"; items: readonly string[] }
  | { type: "dl"; items: ReadonlyArray<{ term: string; desc: string }> }
  | { type: "table"; caption: string; head: readonly string[]; rows: ReadonlyArray<readonly string[]> }
  /** Aviso destacado (borde carmín). */
  | { type: "note"; text: string }
  /** Tabla de encargados del tratamiento, generada desde `SUBPROCESSORS` (no se escribe a mano). */
  | { type: "subprocessors"; caption: string; head: readonly [string, string, string, string] }
  /** Botón que abre el panel de preferencias de cookies (evento `as:consent-open`). */
  | { type: "cookieSettings"; label: string; hint: string };

export interface LegalSection {
  /** id del `<h2>` (ancla del índice) — ASCII, sin espacios */
  id: string;
  title: string;
  blocks: readonly LegalBlock[];
}

export interface LegalDoc {
  /** meta description (≤ 160 caracteres) */
  description: string;
  /** párrafo introductorio bajo el título */
  intro: string;
  sections: readonly LegalSection[];
}
