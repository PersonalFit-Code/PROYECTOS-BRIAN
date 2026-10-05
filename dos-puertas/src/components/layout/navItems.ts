import { Home, BookOpen, MapPin, UtensilsCrossed, Wine } from "lucide-react";
import type { Messages } from "@/i18n/getMessages";

export const NAV_ITEMS = [
  { key: "home", path: "/", icon: Home },
  { key: "carta", path: "/carta", icon: UtensilsCrossed },
  { key: "vinos", path: "/vinos", icon: Wine },
  { key: "historia", path: "/historia", icon: BookOpen },
  { key: "visita", path: "/visita", icon: MapPin },
] as const satisfies ReadonlyArray<{ key: keyof Messages["nav"]; path: string; icon: unknown }>;

/** ¿La ruta `path` (sin idioma) es la activa para `pathname` ("/es/carta")? */
export function isActive(pathname: string, path: string) {
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return path === "/" ? rest === "/" : rest === path || rest.startsWith(`${path}/`);
}
