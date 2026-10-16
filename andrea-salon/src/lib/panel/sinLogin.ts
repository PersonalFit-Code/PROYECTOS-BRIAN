import { SITE_URL_IS_PROVISIONAL } from "@/lib/siteUrl";

/**
 * Panel sin contraseña mientras se desarrolla (lo pidió Brian para ir viendo cambios). Con
 * `PANEL_SIN_LOGIN=1` se entra directamente como la dueña. Dos candados: (1) solo mientras la web vive
 * en el enlace privado de Vercel, que ya exige sesión de Vercel; con dominio propio NO se activa
 * aunque la variable siga puesta; (2) se quita antes de meter clientas reales (docs/lanzamiento.md).
 */
export function panelSinLogin(env: Record<string, string | undefined> = process.env, provisional = SITE_URL_IS_PROVISIONAL): boolean {
  return env.PANEL_SIN_LOGIN === "1" && provisional;
}
