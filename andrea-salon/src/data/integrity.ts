import { BUSINESS } from "./business";
import { EQUIPO_FIXTURE, SERVICIOS_FIXTURE } from "./fixtures";
import { FAQ } from "./faq";
import { GALERIA } from "./galeria";
import { CONSENT_MAX_AGE_MONTHS, LEGAL_DOC_KEYS, LEGAL_UPDATED_AT, SUBPROCESSORS } from "./legal";
import { REVIEWS } from "./reviews";

/**
 * COMPROBACIONES DE LOS DATOS, en el arranque.
 *
 * Los ficheros de `src/data/` se referencian entre sí por id y por texto, y hay una familia de
 * fallos que ningún tipo de TypeScript puede atrapar porque son de VALOR, no de forma:
 *
 *  · una reseña con el id repetido (la cascada usa `key={id}` y React pinta una sola);
 *  · una foto de la galería sin `alt` (una imagen muda para quien usa lector de pantalla, y una
 *    rejilla entera de ellas cuando lleguen las 20 fotos de golpe);
 *  · una fecha de revisión legal mal escrita, o un consentimiento de cookies de 36 meses (la AEPD
 *    admite hasta 24);
 *  · un servicio del fixture con dos slugs iguales: la URL de reserva (`?servicio=<slug>`) apuntaría
 *    a dos cosas.
 *
 * Se ejecuta al importar este módulo desde `app/[locale]/layout.tsx`, lo que en la práctica
 * significa "durante `next build`", porque el build prerenderiza todas las páginas. Si algo no
 * cuadra, **el despliegue no sale**. Con datos estáticos eso es lo que se quiere: más vale un build
 * roto que una web que miente.
 *
 * Cuando el catálogo y el equipo pasen a la base de datos (fase 1b), las comprobaciones del fixture
 * se van con él; el resto se queda.
 */

function fail(errors: string[]): never {
  throw new Error(`Datos inconsistentes:\n  · ${errors.join("\n  · ")}`);
}

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) dupes.add(v);
    seen.add(v);
  }
  return [...dupes];
}

export function assertDataIntegrity(): void {
  const errors: string[] = [];

  /* Reseñas: ids únicos, texto, autora y nota en rango. Las de menos de 4★ no se publican. */
  for (const id of duplicates(REVIEWS.map((r) => r.id))) errors.push(`la reseña "${id}" está repetida en REVIEWS`);
  for (const r of REVIEWS) {
    if (!r.text.trim()) errors.push(`la reseña "${r.id}" no tiene texto`);
    if (!r.author.trim()) errors.push(`la reseña "${r.id}" no tiene autora`);
    if (r.shown && r.rating < 4) errors.push(`la reseña "${r.id}" tiene ${r.rating}★ y está marcada shown: true (no se publican críticas como testimonio)`);
  }

  /* Galería: ids únicos y alt descriptivo en todas (también en los huecos). */
  for (const id of duplicates(GALERIA.map((g) => g.id))) errors.push(`la foto "${id}" está repetida en GALERIA`);
  for (const g of GALERIA) {
    if (g.alt.trim().length < 10) errors.push(`la foto "${g.id}" no tiene un alt descriptivo`);
    if (!g.src.startsWith("/")) errors.push(`la foto "${g.id}" tiene un src que no es una ruta local (${g.src})`);
    if (!g.pendiente && g.src.endsWith("placeholder.svg")) errors.push(`la foto "${g.id}" apunta al marcador pero no está marcada pendiente`);
  }

  /* FAQ: ids únicos, pregunta y respuesta. */
  for (const id of duplicates(FAQ.map((f) => f.id))) errors.push(`la pregunta "${id}" está repetida en FAQ`);
  for (const f of FAQ) {
    if (!f.q.trim().endsWith("?")) errors.push(`la pregunta "${f.id}" no termina en interrogación`);
    if (!f.a.trim()) errors.push(`la pregunta "${f.id}" no tiene respuesta`);
  }

  /* Legal: fecha ISO válida y no futura, consentimiento dentro de lo que admite la AEPD, tres
     documentos y encargados con nombre, finalidad y política. */
  if (!/^\d{4}-\d{2}-\d{2}$/.test(LEGAL_UPDATED_AT) || Number.isNaN(Date.parse(LEGAL_UPDATED_AT))) {
    errors.push(`LEGAL_UPDATED_AT ("${LEGAL_UPDATED_AT}") no es una fecha AAAA-MM-DD válida`);
  }
  if (!(CONSENT_MAX_AGE_MONTHS > 0 && CONSENT_MAX_AGE_MONTHS <= 24)) {
    errors.push(`CONSENT_MAX_AGE_MONTHS (${CONSENT_MAX_AGE_MONTHS}) tiene que estar entre 1 y 24 meses`);
  }
  if (LEGAL_DOC_KEYS.length !== 3) errors.push("tiene que haber exactamente tres documentos legales (privacidad, aviso legal, cookies)");
  for (const id of duplicates(SUBPROCESSORS.map((s) => s.id))) errors.push(`el encargado "${id}" está repetido en SUBPROCESSORS`);
  for (const s of SUBPROCESSORS) {
    if (!s.name.trim() || !s.role.trim() || !s.location.trim()) errors.push(`el encargado "${s.id}" tiene un campo vacío`);
    if (!/^https:\/\//.test(s.privacyUrl)) errors.push(`el encargado "${s.id}" no tiene una política de privacidad https`);
  }
  if (BUSINESS.legal.holder !== null && !BUSINESS.legal.holder.trim()) errors.push("BUSINESS.legal.holder está vacío (usa null si no se sabe)");

  /* Negocio: horario coherente (apertura antes del cierre, formato HH:MM). */
  for (const [day, ranges] of Object.entries(BUSINESS.hours)) {
    for (const r of ranges) {
      if (!/^\d{2}:\d{2}$/.test(r.open) || !/^\d{2}:\d{2}$/.test(r.close)) errors.push(`el horario del ${day} no está en formato HH:MM`);
      else if (r.close !== "00:00" && r.close <= r.open) errors.push(`el horario del ${day} cierra (${r.close}) antes de abrir (${r.open})`);
    }
  }

  /* Fixture (hasta la fase 1b): slugs únicos, precios coherentes con `precioDesde`, duración > 0. */
  for (const slug of duplicates(SERVICIOS_FIXTURE.map((s) => s.slug))) errors.push(`el servicio "${slug}" está repetido en SERVICIOS_FIXTURE`);
  for (const s of SERVICIOS_FIXTURE) {
    if (!(s.duracionMin > 0)) errors.push(`"${s.slug}" tiene una duración inválida (${s.duracionMin})`);
    if (s.precioCents !== null && !(s.precioCents > 0)) errors.push(`"${s.slug}" tiene un precio inválido (${s.precioCents})`);
    if (s.precioCents === null && !s.precioDesde) errors.push(`"${s.slug}" no tiene precio ni está marcado "desde": la tarjeta no sabría qué pintar`);
  }
  for (const slug of duplicates(EQUIPO_FIXTURE.map((p) => p.slug))) errors.push(`la profesional "${slug}" está repetida en EQUIPO_FIXTURE`);
  for (const p of EQUIPO_FIXTURE) {
    if (!p.foto.alt.trim()) errors.push(`la profesional "${p.slug}" no tiene alt en la foto`);
  }

  if (errors.length) fail(errors);
}

assertDataIntegrity();
