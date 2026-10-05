import type { Messages } from "@/i18n/getMessages";

export const NAV_ITEMS = [
  { key: "home", path: "/" },
  { key: "carta", path: "/carta" },
  { key: "vinos", path: "/vinos" },
  { key: "historia", path: "/historia" },
  { key: "visita", path: "/visita" },
  { key: "preguntas", path: "/preguntas" },
] as const satisfies ReadonlyArray<{ key: keyof Messages["nav"]["items"]; path: string }>;

export const LEGAL_PAGES = ["aviso-legal", "privacidad", "cookies"] as const;
export type LegalSlug = (typeof LEGAL_PAGES)[number];

/** ¿La ruta `path` (sin idioma) es la activa para `pathname` ("/es/carta")? */
export function isActive(pathname: string, path: string) {
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return path === "/" ? rest === "/" : rest === path || rest.startsWith(`${path}/`);
}
