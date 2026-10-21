/**
 * MÓDULO LEGAL — la parte que SÍ puede bajar al navegador.
 *
 * POR QUÉ ESTÁ SEPARADO DE `legal.ts`. En el mismo módulo vivían dos cosas que no tienen nada que
 * ver: el bloque de identidad de la titular (nombre, NIF, domicilio y correo, en
 * `LEGAL_PLACEHOLDERS`) y un par de constantes que el banner de cookies y el pie necesitan en el
 * cliente. Como el banner está en el layout de los cuatro idiomas, el empaquetador se traía el
 * módulo ENTERO al fragmento de JavaScript de la portada: medido tras `npm run build`, el NIF y el
 * correo de Tatiana aparecían literalmente en un chunk que descargan la portada, /carta y /vinos,
 * páginas que no los pintan.
 *
 * Hoy el daño es cero: son los datos que el art. 10.1 de la LSSI obliga a publicar y ya están en
 * /legal/aviso-legal, que cuelga del pie de todas las páginas. Lo que se arregla es el LÍMITE: el
 * día que ahí se escriba un teléfono privado o un domicilio que no sea el del local, bajaría al
 * navegador de toda la web sin que nada lo avisara. Con el corte, `legal.ts` solo lo importan el
 * servidor y la página legal, que es la que de verdad lo enseña.
 *
 * REGLA: aquí NO entra ningún dato personal. Si algo de aquí lo necesita el cliente, es porque no
 * identifica a nadie.
 */

/** Claves de los tres documentos legales (coinciden con `m.legal.docs.*`). */
export const LEGAL_DOC_KEYS = ["privacy", "legalNotice", "cookies"] as const;
export type LegalDocKey = (typeof LEGAL_DOC_KEYS)[number];

export function isLegalDocKey(value: string): value is LegalDocKey {
  return (LEGAL_DOC_KEYS as readonly string[]).includes(value);
}

/** Vigencia del consentimiento de cookies (la AEPD recomienda no superar los 24 meses). */
export const CONSENT_MAX_AGE_MONTHS = 12;
