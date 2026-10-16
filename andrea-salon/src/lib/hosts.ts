import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * TRES ENTRADAS, UNA SOLA APLICACIÓN.
 *
 * La web (`andreasalon.es`), la reserva (`reservar.andreasalon.es`) y el panel
 * (`panel.andreasalon.es`) son la misma app de Next desplegada una vez. El `proxy.ts` mira el host
 * con el que entra la petición y la reescribe al grupo de rutas que toca:
 *
 *   reservar.x/es/…   →  /es/reservar/…        (grupo `(reservar)`)
 *   panel.x/…         →  /panel/…              (grupo `(panel)`, sin idioma)
 *   equipo.x/…        →  308 a x/es/equipo     (alias: ahí no se sirve nada)
 *
 * MIENTRAS NO HAY DOMINIO (andreasalonnails.vercel.app, previews, localhost) las variables
 * `NEXT_PUBLIC_RESERVAR_URL` y `NEXT_PUBLIC_PANEL_URL` van vacías y todo funciona por rutas:
 * `/es/reservar`, `/panel`. Ningún componente debe saber en qué modo está: para construir un enlace
 * a otra sección se usa `urlFor`, que devuelve la URL absoluta correcta en los dos modos. Los
 * correos, el QR de los bonos y los botones "Reservar" pasan todos por aquí.
 */
export type Seccion = "web" | "reservar" | "panel";
export type SeccionHost = Seccion | "equipo";

function limpia(valor: string | undefined): string {
  return (valor ?? "").trim().replace(/\/+$/, "");
}

const RESERVAR_URL = limpia(process.env.NEXT_PUBLIC_RESERVAR_URL);
const PANEL_URL = limpia(process.env.NEXT_PUBLIC_PANEL_URL);

/** Con las dos variables puestas, cada sección vive en su subdominio; si no, en rutas. */
export const MODO_SUBDOMINIOS = RESERVAR_URL !== "" && PANEL_URL !== "";

function hostDe(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

const HOST_WEB = hostDe(SITE_URL);
const HOST_RESERVAR = RESERVAR_URL ? hostDe(RESERVAR_URL) : null;
const HOST_PANEL = PANEL_URL ? hostDe(PANEL_URL) : null;

/**
 * `equipo.<dominio>` solo existe con dominio propio: en *.vercel.app no se pueden crear subdominios
 * y en localhost no tiene sentido. Se deriva del dominio raíz para no necesitar otra variable.
 */
const HOST_EQUIPO =
  HOST_WEB && !/\.vercel\.app$/.test(HOST_WEB) && HOST_WEB !== "localhost"
    ? `equipo.${HOST_WEB.replace(/^www\./, "")}`
    : null;

/** Qué sección pide una petición según su cabecera Host (sin puerto). Lo desconocido es la web. */
export function seccionPorHost(host: string | null | undefined): SeccionHost {
  const h = (host ?? "").toLowerCase().split(":")[0];
  if (!h) return "web";
  if (HOST_RESERVAR && h === HOST_RESERVAR) return "reservar";
  if (HOST_PANEL && h === HOST_PANEL) return "panel";
  if (HOST_EQUIPO && h === HOST_EQUIPO) return "equipo";
  return "web";
}

/** Separa "/ruta?x=1#y" en ["/ruta", "?x=1#y"] para no meter el idioma dentro de la query. */
function partirSufijo(path: string): [string, string] {
  const i = path.search(/[?#]/);
  if (i === -1) return [path, ""];
  return [path.slice(0, i), path.slice(i)];
}

function normaliza(path: string): string {
  const p = path.trim();
  if (p === "" || p === "/") return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

/** Antepone el idioma si la ruta no lo lleva ya ("/equipo" → "/es/equipo"; "/es/equipo" se respeta). */
function conIdioma(path: string, locale: Locale): string {
  const [ruta, sufijo] = partirSufijo(normaliza(path));
  const primero = ruta.split("/")[1];
  if (isLocale(primero)) return `${ruta}${sufijo}`;
  return `${ruta === "/" ? `/${locale}` : `/${locale}${ruta}`}${sufijo}`;
}

/**
 * URL absoluta de una ruta dentro de una sección.
 *
 *   urlFor("web", "/equipo")            → https://andreasalon.es/es/equipo
 *   urlFor("reservar", "/?con=andrea")  → https://reservar.andreasalon.es/es?con=andrea
 *                                        (sin dominio: https://…vercel.app/es/reservar?con=andrea)
 *   urlFor("panel", "/agenda")          → https://panel.andreasalon.es/agenda
 *                                        (sin dominio: https://…vercel.app/panel/agenda)
 *
 * `path` va SIN idioma (se añade según `locale`), salvo en el panel, que no tiene idioma.
 */
export function urlFor(seccion: Seccion, path = "/", locale: Locale = DEFAULT_LOCALE): string {
  switch (seccion) {
    case "web":
      return `${SITE_URL}${conIdioma(path, locale)}`;
    case "reservar": {
      if (RESERVAR_URL) return `${RESERVAR_URL}${conIdioma(path, locale)}`;
      const [ruta, sufijo] = partirSufijo(normaliza(path));
      return `${SITE_URL}/${locale}/reservar${ruta === "/" ? "" : ruta}${sufijo}`;
    }
    case "panel": {
      const [ruta, sufijo] = partirSufijo(normaliza(path));
      const base = PANEL_URL || `${SITE_URL}/panel`;
      return `${base}${ruta === "/" ? "" : ruta}${sufijo}`;
    }
  }
}

/** Ruta RELATIVA de la reserva dentro de la app (para <Link>): siempre /<locale>/reservar/… */
export function rutaReserva(path = "/", locale: Locale = DEFAULT_LOCALE): string {
  const [ruta, sufijo] = partirSufijo(normaliza(path));
  return `/${locale}/reservar${ruta === "/" ? "" : ruta}${sufijo}`;
}
