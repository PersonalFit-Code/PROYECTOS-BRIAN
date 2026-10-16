import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "@/i18n/config";
import { MODO_SUBDOMINIOS, seccionPorHost, urlFor } from "@/lib/hosts";
import { updateSession } from "@/lib/supabase/proxy-session";

const COOKIE = "NEXT_LOCALE";

/** Páginas de la reserva que en el subdominio se sirven sin el prefijo "/reservar". */
const SUBRUTAS_RESERVA = ["/cita", "/confirmada"];

/**
 * Cookie de idioma: solo guarda "es"/"gl" (no identifica a nadie, por eso es técnica y no necesita
 * consentimiento). `secure` para que no viaje por http y `sameSite: "lax"` para que no la manden
 * otras webs. Sin `httpOnly` a propósito: el selector de idioma la reescribe desde el navegador.
 */
function cookieOptions(request: NextRequest) {
  return {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax" as const,
    secure: request.nextUrl.protocol === "https:",
  };
}

/**
 * MANDA LA CASA, NO EL TELÉFONO (herencia de tixola): quien llega sin prefijo entra en castellano,
 * salvo que ya haya elegido otro idioma con el selector (cookie). Nunca se negocia con
 * `Accept-Language`: un iPhone manda su lista entera de idiomas y acababa sirviendo la web en
 * inglés a gente de Ourense.
 */
function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  return DEFAULT_LOCALE;
}

/** "/es/equipo" → { locale: "es", resto: "/equipo" }; "/equipo" → { locale: null, resto: "/equipo" } */
function partirIdioma(pathname: string): { locale: Locale | null; resto: string } {
  const [, primero, ...resto] = pathname.split("/");
  if (isLocale(primero)) {
    const r = resto.join("/");
    return { locale: primero, resto: r ? `/${r}` : "/" };
  }
  return { locale: null, resto: pathname };
}

function conCookie(res: NextResponse, request: NextRequest, locale: Locale): NextResponse {
  if (request.cookies.get(COOKIE)?.value !== locale) {
    res.cookies.set(COOKIE, locale, cookieOptions(request));
  }
  return res;
}

/**
 * Proxy (Next 16): decide qué sección sirve según el HOST y añade el prefijo de idioma.
 * El mapa de hosts y los dos modos (subdominios / rutas) están explicados en `lib/hosts.ts`.
 */
export async function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const seccion = seccionPorHost(host);
  const { pathname, search } = request.nextUrl;

  // 1 · equipo.<dominio> es un alias: nada se sirve ahí, se manda a la página de equipo de la web.
  if (seccion === "equipo") {
    const { locale } = partirIdioma(pathname);
    return NextResponse.redirect(urlFor("web", "/equipo", locale ?? detectLocale(request)), 308);
  }

  // 2 · PANEL (sin idioma). Entra por panel.<dominio> o por /panel en modo rutas.
  const esRutaPanel = pathname === "/panel" || pathname.startsWith("/panel/");
  if (seccion === "panel") {
    const { locale, resto } = partirIdioma(pathname);
    // panel.x/es/servicios: eso es la web, no el panel.
    if (locale) return NextResponse.redirect(urlFor("web", resto, locale), 308);
    const url = request.nextUrl.clone();
    url.pathname = esRutaPanel ? pathname : `/panel${pathname === "/" ? "" : pathname}`;
    const res = url.pathname === pathname ? NextResponse.next() : NextResponse.rewrite(url);
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return updateSession(request, res);
  }
  if (esRutaPanel) {
    // Con subdominios, /panel en el dominio raíz (o en reservar.) vive en panel.<dominio>.
    if (MODO_SUBDOMINIOS) {
      return NextResponse.redirect(urlFor("panel", pathname.replace(/^\/panel/, "") || "/"), 308);
    }
    const res = NextResponse.next();
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return updateSession(request, res);
  }

  // 3 · IDIOMA: sin prefijo → redirección visible al idioma elegido, en el mismo host.
  const { locale, resto } = partirIdioma(pathname);
  if (!locale) {
    const elegido = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${elegido}${pathname === "/" ? "" : pathname}`;
    return conCookie(NextResponse.redirect(url, 307), request, elegido);
  }

  // 4 · RESERVA por subdominio: reescritura invisible al grupo (reservar).
  if (seccion === "reservar") {
    const esReserva = resto === "/reservar" || resto.startsWith("/reservar/");
    const esLegal = resto === "/legal" || resto.startsWith("/legal/");
    // `urlFor("reservar", "/cita/…")` emite reservar.x/es/cita/…: las subrutas de la reserva van
    // sin el "/reservar" delante en el subdominio y se reescriben al grupo.
    const esSubrutaReserva = SUBRUTAS_RESERVA.some((r) => resto === r || resto.startsWith(`${r}/`));
    if (resto === "/" || esSubrutaReserva) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/reservar${resto === "/" ? "" : resto}`;
      return conCookie(NextResponse.rewrite(url), request, locale);
    }
    if (esReserva || esLegal) return conCookie(NextResponse.next(), request, locale);
    // reservar.x/es/servicios: no duplicar la web en el subdominio.
    return NextResponse.redirect(`${urlFor("web", resto, locale)}${search}`, 308);
  }

  // 5 · En la web, con subdominios, /es/reservar vive en reservar.<dominio>.
  if (MODO_SUBDOMINIOS && (resto === "/reservar" || resto.startsWith("/reservar/"))) {
    const sin = resto.replace(/^\/reservar/, "") || "/";
    return NextResponse.redirect(`${urlFor("reservar", sin, locale)}${search}`, 308);
  }

  return conCookie(NextResponse.next(), request, locale);
}

export const config = {
  // Todo excepto API, assets de Next, ficheros estáticos y metadatos.
  matcher: ["/((?!api|_next|.*\\..*|robots.txt|sitemap.xml|og.jpg|favicon.svg|manifest.webmanifest).*)"],
};

export { LOCALES };
