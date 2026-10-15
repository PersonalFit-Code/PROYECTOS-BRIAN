import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "@/i18n/config";

const COOKIE = "NEXT_LOCALE";

/**
 * Opciones de la cookie de idioma. Solo guarda "es"/"gl"/"en"/"pt" (no identifica a nadie, por eso es
 * técnica y no necesita consentimiento), pero igualmente: `secure` para que no viaje nunca por http,
 * `sameSite: "lax"` para que no la manden otras webs. Sin `httpOnly` a propósito: el selector de idioma
 * (`LanguageSwitcher`) la reescribe desde el navegador, y no guarda nada que merezca esconderse.
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
 * Idioma con el que entra quien llega sin prefijo.
 *
 * MANDA LA CASA, NO EL TELÉFONO. Antes esto negociaba con la cabecera `Accept-Language`, y el
 * resultado en la calle era que la misma persona entraba un día en inglés y otro en portugués según
 * lo que llevara configurado el móvil —un iPhone manda su lista entera de idiomas preferidos, no uno
 * solo—. Para una tapería de Ourense eso no es "detectar bien el idioma", es que el cliente de al
 * lado abre su web y la ve en un idioma que no habla. Así que se entra SIEMPRE en castellano.
 *
 * Lo que sí se respeta es la decisión explícita: si alguien pulsa GL, EN o PT, el selector deja la
 * cookie puesta y a partir de ahí entra en el idioma que eligió. Y los cuatro idiomas siguen
 * publicados e indexados por separado con sus `hreflang`, así que un buscador le sirve a un
 * portugués la versión portuguesa directamente; lo que cambia es solo la puerta de entrada sin
 * prefijo.
 */
function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  return DEFAULT_LOCALE;
}

/**
 * Proxy (Next 16): añade el prefijo de idioma a las rutas que no lo llevan
 * y recuerda el idioma elegido en una cookie.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    const res = NextResponse.next();
    if (request.cookies.get(COOKIE)?.value !== first) {
      res.cookies.set(COOKIE, first, cookieOptions(request));
    }
    return res;
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url, 307);
  res.cookies.set(COOKIE, locale, cookieOptions(request));
  return res;
}

export const config = {
  // Todo excepto API, assets de Next, ficheros estáticos y metadatos
  matcher: ["/((?!api|_next|.*\\..*|robots.txt|sitemap.xml|og.jpg|favicon.svg).*)"],
};

export { LOCALES };
