import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

/**
 * El idioma preferido del navegador (cabecera Accept-Language), si es uno de los de la web; si no,
 * español. Solo decide adónde va quien entra sin idioma en la dirección: no se guarda nada.
 */
function preferido(request: NextRequest): Locale {
  const prefs = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { code: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .filter((p) => p.code && !Number.isNaN(p.q))
    .sort((a, b) => b.q - a.q);
  return prefs.find((p) => isLocale(p.code))?.code as Locale | undefined ?? DEFAULT_LOCALE;
}

/** Añade el prefijo de idioma a las rutas que no lo llevan. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isLocale(pathname.split("/")[1])) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/${preferido(request)}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Vary", "Accept-Language");
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*|robots.txt|sitemap.xml).*)"],
};
