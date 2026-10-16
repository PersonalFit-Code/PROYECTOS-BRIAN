import type { Messages } from "@/i18n/types";

/**
 * Las secciones de la web pública, en el orden del menú lateral y del pie. La etiqueta sale de
 * `m.nav.items[key]` (tipado: una clave que no exista en los mensajes no compila).
 */
export const NAV_ITEMS = [
  { key: "home", path: "/" },
  { key: "servicios", path: "/servicios" },
  { key: "equipo", path: "/equipo" },
  { key: "galeria", path: "/galeria" },
  { key: "resenas", path: "/resenas" },
  { key: "bonos", path: "/bonos" },
  { key: "contacto", path: "/contacto" },
] as const satisfies ReadonlyArray<{ key: keyof Messages["nav"]["items"]; path: string }>;

/** ¿La ruta `path` (sin idioma) es la activa para `pathname` ("/es/servicios")? */
export function isActive(pathname: string, path: string) {
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return path === "/" ? rest === "/" : rest === path || rest.startsWith(`${path}/`);
}
