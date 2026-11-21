/**
 * Modo sin login, SOLO para desarrollo y pruebas: con APP_SIN_LOGIN=1 y APP_USER_ID, la app entra
 * directamente como ese usuario (leyendo con la clave de servicio). En producción no se activa
 * nunca, aunque alguien deje la variable puesta en Vercel.
 */
export function sinLogin(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.APP_SIN_LOGIN === "1" && Boolean(process.env.APP_USER_ID);
}
