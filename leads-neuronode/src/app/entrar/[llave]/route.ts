import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Enlace de acceso del equipo: /entrar/<llave>. Quien lo abre queda dentro en ese navegador, sin
 * escribir usuario ni contraseña. La llave y la cuenta compartida viven en las variables de entorno
 * (ACCESO_LLAVE, ACCESO_EMAIL, ACCESO_CLAVE), nunca en el código.
 */
function igual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ llave: string }> }) {
  const { llave } = await params;
  const { ACCESO_LLAVE, ACCESO_EMAIL, ACCESO_CLAVE } = process.env;
  const destino = (ruta: string) => NextResponse.redirect(new URL(ruta, request.url), 303);

  if (!ACCESO_LLAVE || ACCESO_LLAVE.length < 20 || !ACCESO_EMAIL || !ACCESO_CLAVE) return destino("/login?fallo=config");
  if (!igual(llave, ACCESO_LLAVE)) return destino("/login?fallo=llave");

  const db = await createSessionClient();
  const { error } = await db.auth.signInWithPassword({ email: ACCESO_EMAIL, password: ACCESO_CLAVE });
  return destino(error ? "/login?fallo=config" : "/");
}
