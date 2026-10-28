import { NextResponse, type NextRequest } from "next/server";
import { sinLogin } from "@/lib/sinLogin";
import { updateSession } from "@/lib/supabase/proxy-session";

/**
 * Toda la app es privada. Sin sesión, cualquier página manda a /login; las rutas de API responden
 * ellas mismas (el cron con su secreto, el chat con 401).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const res = NextResponse.next();
  res.headers.set("x-robots-tag", "noindex, nofollow");
  if (sinLogin()) return res;

  const { response, logueado } = await updateSession(request, res);
  const publica = pathname === "/login" || pathname.startsWith("/api/");
  if (!logueado && !publica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (logueado && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  // Todo menos estáticos, iconos, manifest y el service worker (tienen que cargarse sin sesión).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|.*\\.png$).*)"],
};
