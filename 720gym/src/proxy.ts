import { NextResponse, type NextRequest } from "next/server";

/**
 * SUBDOMINIOS POR CONCEPTO. Con el dominio de 720 en Vercel (y un registro DNS comodín
 * *.su-dominio), pilates.su-dominio sirve /pilates, crossgym.su-dominio sirve /crossgym, etc.
 * Mientras la web esté en vercel.app no hay subdominios: se usan las direcciones cortas.
 */
const SUBDOMINIOS: Record<string, string> = {
  pilates: "/pilates",
  crossgym: "/crossgym",
  powerlifting: "/powerlifting",
  yoga: "/yoga",
  gimnasio: "/gimnasio",
  entrenador: "/entrenamiento-personal",
};

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const sub = host.split(".")[0];
  if (host.endsWith(".vercel.app") || host.startsWith("localhost") || !(sub in SUBDOMINIOS)) return NextResponse.next();
  const destino = SUBDOMINIOS[sub];
  const url = request.nextUrl.clone();
  if (url.pathname === "/") {
    url.pathname = destino;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  /* Solo la raíz: el resto de rutas y los estáticos no pasan por aquí. */
  matcher: "/",
};
