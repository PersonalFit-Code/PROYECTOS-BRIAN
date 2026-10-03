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
export const LEGAL_UPDATED_AT = "2026-10-03";

/**
 * Datos del responsable del tratamiento. Los mandó la casa el 3 de octubre de 2026: el negocio es
 * de una empresaria individual, Tatiana González Ferreira, con NIF 44450501B y domicilio en el
 * propio local de Rúa Juan de Austria 7.
 *
 * FALTA UNO, el correo, y por eso sigue entre corchetes: el art. 10.1.a de la LSSI exige una
 * dirección de correo electrónico, y además es el canal escrito por el que alguien ejerce sus
 * derechos del RGPD. Un correo no se puede deducir del nombre ni del dominio: o lo da la casa, o no
 * se publica. Mientras tanto se resalta en la web y las tres páginas legales siguen sin indexar
 * (ver `LEGAL_IDENTITY_PENDING`), que es justo lo que tiene que pasar.
 */
export const LEGAL_PLACEHOLDERS = {
  /** Titular del negocio. Es una persona física, así que el titular es ella y no una sociedad. */
  companyName: "Tatiana González Ferreira",
  /** NIF del titular */
  nif: "44450501B",
  /** Domicilio a efectos legales: el propio local */
  registeredOffice: "Rúa Juan de Austria 7, 32005 Ourense",
  /** Correo para contacto y ejercicio de derechos */
  email: "[EMAIL DE CONTACTO]",
  /**
   * Inscripción registral. Vacío A PROPÓSITO y no por falta de dato: el art. 10.1.b de la LSSI pide
   * los datos de inscripción SOLO a quien esté inscrito en un registro mercantil o equivalente, y
   * una empresaria individual no lo está. `LegalArticle` se salta la fila cuando queda vacía.
   */
  registry: "",
} as const;

export type LegalPlaceholderKey = keyof typeof LEGAL_PLACEHOLDERS;

/**
 * `true` mientras quede algún marcador sin sustituir. En ese estado el aviso legal NO contiene los
 * datos identificativos que exige el art. 10 LSSI-CE y la política de privacidad no ofrece un canal
 * escrito para ejercer los derechos del RGPD (la tarjeta de contacto oculta el botón de correo),
 * así que las tres páginas se publican con `noindex` y quedan fuera del sitemap. En cuanto el
 * cliente confirme los datos y desaparezcan los corchetes, vuelven a indexarse solas.
 */
export const LEGAL_IDENTITY_PENDING: boolean = Object.values(LEGAL_PLACEHOLDERS).some(
  (value) => value.startsWith("[") && value.endsWith("]"),
);

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
