import type { Locale } from "@/i18n/config";

/**
 * PROMOCIÓN DEL MES — el único archivo que hay que tocar para anunciar algo.
 *
 * Lo pidió Tatiana: poder decir "este mes tenemos cata de vinos" o "promoción en tal" sin depender
 * de una web nueva cada vez. La idea es que cambiar esto sean cuatro líneas y volver a publicar, y
 * que forme parte del mantenimiento mensual.
 *
 * CÓMO SE USA
 *  · Para anunciar algo: rellena `PROMO` con los textos y las fechas.
 *  · Para quitarlo: pon `PROMO = null`. La banda desaparece y la web no se entera de nada.
 *  · Si se pasa la fecha de fin, desaparece sola. Es la red para cuando a alguien se le olvide.
 *
 * El castellano es obligatorio; los demás idiomas son opcionales y, si faltan, se enseña el
 * castellano. Es deliberado: una promoción es urgente y no puede esperar a cuatro traducciones.
 */

export interface PromoText {
  /** Titular corto. Cabe poco: cuatro o cinco palabras. */
  title: string;
  /** Una frase. Si necesitas dos, probablemente sea una sección, no una promoción. */
  text: string;
}

export interface Promo {
  /** Cambia el id al publicar una promoción nueva: así se reabre para quien ya la había cerrado. */
  id: string;
  /** Textos por idioma. `es` es obligatorio y hace de respaldo para el resto. */
  text: { es: PromoText } & Partial<Record<Exclude<Locale, "es">, PromoText>>;
  /** AAAA-MM-DD. Antes de esta fecha no se ve. Opcional: sin ella, se ve desde ya. */
  from?: string;
  /** AAAA-MM-DD, incluido. Después de esta fecha desaparece sola. Opcional, pero conviene ponerla. */
  until?: string;
  /** Enlace opcional: una ruta interna ("/carta") o una URL completa. */
  href?: string;
  /** Texto del enlace. Si hay `href`, hace falta. */
  cta?: string;
}

/**
 * La promoción viva, o `null` si no hay ninguna.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EJEMPLO (descomentar y editar):
 *
 * export const PROMO: Promo | null = {
 *   id: "cata-octubre-2026",
 *   from: "2026-10-01",
 *   until: "2026-10-31",
 *   text: {
 *     es: { title: "Cata de vinos en octubre", text: "Un jueves al mes abrimos botellas y las explicamos. Plazas limitadas." },
 *     gl: { title: "Cata de viños en outubro", text: "Un xoves ao mes abrimos botellas e explicámolas. Prazas limitadas." },
 *   },
 *   href: "tel:+34646457274",
 *   cta: "Llámanos",
 * };
 * ────────────────────────────────────────────────────────────────────────────
 */
export const PROMO: Promo | null = null;

/**
 * ¿Está viva la promoción en esta fecha? Las fechas se comparan como texto AAAA-MM-DD, que para
 * ese formato ordena igual que por calendario y evita construir objetos `Date` con zonas horarias
 * de por medio. `until` es INCLUSIVO: una promoción que termina el 31 se ve el día 31 entero.
 */
export function promoActivo(promo: Promo | null, hoy: string): promo is Promo {
  if (!promo) return false;
  if (promo.from && hoy < promo.from) return false;
  if (promo.until && hoy > promo.until) return false;
  return true;
}

/** Los textos en el idioma pedido, con respaldo al castellano. */
export function promoText(promo: Promo, locale: Locale): PromoText {
  return promo.text[locale as Exclude<Locale, "es">] ?? promo.text.es;
}
