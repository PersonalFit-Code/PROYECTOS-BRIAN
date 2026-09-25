/**
 * MÓDULO LEGAL — constantes y tipos.
 *
 * Aquí vive únicamente lo que NO se traduce: la fecha de revisión, los marcadores del
 * responsable del tratamiento (pendientes de que el cliente los confirme) y la forma
 * (tipos) del contenido estructurado. El TEXTO de los tres documentos y del banner está
 * en `src/i18n/messages/<idioma>/legal.ts`, así cada idioma puede traducirlo.
 */

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
export const LEGAL_UPDATED_AT = "2026-09-25";

/**
 * Datos del responsable del tratamiento que el cliente debe confirmar.
 * Mientras conserven los corchetes se muestran RESALTADOS en la web para que no pasen
 * desapercibidos. Sustitúyelos por los datos reales y desaparecerá el resalte.
 * ⚠️ No inventar: la razón social puede no coincidir con el nombre comercial "Tixola Tapería".
 */
export const LEGAL_PLACEHOLDERS = {
  /** Razón social del titular (persona física o jurídica) */
  companyName: "[RAZÓN SOCIAL]",
  /** NIF / CIF del titular */
  nif: "[NIF]",
  /** Domicilio social (puede coincidir con el local) */
  registeredOffice: "[DOMICILIO SOCIAL]",
  /** Correo para contacto y ejercicio de derechos */
  email: "[EMAIL DE CONTACTO]",
  /** Datos de inscripción registral, solo si el titular es una sociedad */
  registry: "[DATOS REGISTRALES, SI PROCEDE]",
} as const;

export type LegalPlaceholderKey = keyof typeof LEGAL_PLACEHOLDERS;

/**
 * Detecta marcadores "[ASÍ, EN MAYÚSCULAS]" que aún no se han sustituido. Se usa para
 * resaltarlos en `LegalArticle`. Global (g) para `String.prototype.split` con captura.
 */
export const PLACEHOLDER_PATTERN = /(\[[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 ,./-]*\])/g;

/** Vigencia del consentimiento de cookies (la AEPD recomienda no superar los 24 meses). */
export const CONSENT_MAX_AGE_MONTHS = 12;

/* ──────────────────────────────────────────────────────────────
   Contenido estructurado (forma de m.legal.docs.*)
   ────────────────────────────────────────────────────────────── */

/**
 * Bloques que sabe pintar `LegalArticle`. Los textos admiten:
 *  - marcadores `{clave}` (responsable, dirección, teléfono, fecha…) → `useFormat()`;
 *  - enlaces `[texto](destino)` donde destino es `privacy` | `legalNotice` | `cookies` |
 *    `home` | `carta` | una URL http(s) | `mailto:` | `tel:`;
 *  - énfasis `**texto**`.
 */
export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: readonly string[] }
  | { type: "ol"; items: readonly string[] }
  | { type: "dl"; items: ReadonlyArray<{ term: string; desc: string }> }
  | { type: "table"; caption: string; head: readonly string[]; rows: ReadonlyArray<readonly string[]> }
  /** Aviso destacado (borde pimentón). */
  | { type: "note"; text: string }
  /** Botón que abre el panel de preferencias de cookies (evento `tixola:cookie-settings`). */
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

export interface LegalFaqItem {
  q: string;
  a: string;
}
