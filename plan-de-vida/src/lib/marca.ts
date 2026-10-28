/**
 * Nombre de la app y del coach. Para renombrar la app basta con cambiar APP_NOMBRE (y el título de
 * public/sw.js, que no puede importar esto). El coach se renombra desde Ajustes; este es el de serie.
 */
export const APP_NOMBRE = "Noah.ai";
export const COACH_POR_DEFECTO = "Noah";

export function nombreCoach(ajustes: { coach_name?: string | null } | null | undefined): string {
  return ajustes?.coach_name?.trim() || COACH_POR_DEFECTO;
}
