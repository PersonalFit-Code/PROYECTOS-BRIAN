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
 *
 * SE QUEDÓ VIEJA DOS VECES, y por eso este recordatorio es más largo que el dato. El 15-10-2026
 * entró el correo de contacto (art. 10.1.a LSSI) y nadie tocó esta línea; el 18-10-2026 se publicó
 * el dominio propio y, como los tres documentos incrustan `{siteUrl}`, su texto cambió otra vez.
 * No es cosmético: las páginas le dicen al visitante que la versión en vigor es la de ESTA fecha,
 * así que una fecha vieja afirma que el texto no ha cambiado cuando sí lo ha hecho.
 * El 20-10-2026 entraron Google Analytics 4 y Microsoft Clarity, que es el cambio más grande que han
 * tenido estos documentos desde que se escribieron: tres apartados nuevos, cuatro filas en la tabla
 * de cookies y un proveedor que NO es encargado nuestro. Ese mismo día se subió `CONSENT_VERSION`,
 * porque un texto nuevo que cambia lo que pasa al aceptar obliga a volver a preguntar.
 */
export const LEGAL_UPDATED_AT = "2026-10-20";

/**
 * Datos del responsable del tratamiento. Los mandó la casa el 3 de octubre de 2026: el negocio es
 * de una empresaria individual, Tatiana González Ferreira, con NIF 44450501B y domicilio en el
 * propio local de Rúa Juan de Austria 7.
 *
 * YA NO FALTA NINGUNO. El correo lo dio la propia Tatiana el 15-10-2026 y con él
 * `LEGAL_IDENTITY_PENDING` pasa a false solo: el aviso legal ya tiene los cuatro datos del art.
 * 10.1 de la LSSI y las tres páginas legales vuelven a indexarse y al sitemap.
 * Es una cuenta de Gmail a su nombre, no un buzón del dominio, y mientras no haya dominio propio es
 * lo correcto: lo que la ley pide es una dirección que funcione y que lea alguien, no que sea
 * corporativa. Cuando se compre el dominio conviene migrarlo, pero no bloquea nada.
 * EL PLAZO ES DE UN MES: por aquí se ejercen los derechos del RGPD, así que el buzón tiene que
 * mirarse. Un correo publicado que nadie lee es peor que no tenerlo.
 */
export const LEGAL_PLACEHOLDERS = {
  /** Titular del negocio. Es una persona física, así que el titular es ella y no una sociedad. */
  companyName: "Tatiana González Ferreira",
  /** NIF del titular */
  nif: "44450501B",
  /**
   * Domicilio a efectos legales: el propio local.
   * ESCRITO IGUAL QUE `BUSINESS.address.full` a propósito. El aviso legal pinta este domicilio y,
   * dos renglones más abajo, el del establecimiento, que sale de `business.ts`. Con una coma de
   * diferencia tras el nombre de la calle parecían dos direcciones distintas o una errata.
   */
  registeredOffice: "Rúa Juan de Austria, 7, 32005 Ourense",
  /** Correo para contacto y ejercicio de derechos */
  email: "gonzalezferreiratatiana@gmail.com",
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
