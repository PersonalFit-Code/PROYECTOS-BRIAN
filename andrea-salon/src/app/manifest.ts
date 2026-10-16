import type { MetadataRoute } from "next";
import { BUSINESS } from "@/data/business";

/**
 * Manifiesto: nombre, colores e icono al añadir la web a la pantalla de inicio. Hoy solo el SVG;
 * PENDIENTE: `icon-192.png` y `icon-512.png` (Android los prefiere en PNG) desde el logo vectorial.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BUSINESS.name,
    short_name: BUSINESS.name,
    start_url: "/",
    display: "standalone",
    background_color: "#fdf7f9",
    theme_color: "#fdf7f9",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
