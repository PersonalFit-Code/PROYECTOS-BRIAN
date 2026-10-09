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

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  const header = request.headers.get("accept-language") ?? "";
  const candidates = header
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .filter(Boolean);
  for (const c of candidates) {
    const base = c.split("-")[0];
    if (isLocale(base)) return base;
  }
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
