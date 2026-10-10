import type { MetadataRoute } from "next";
import { BUSINESS } from "@/data/business";

/** Manifiesto: nombre, colores e iconos cuando alguien añade la web a la pantalla de inicio en Android. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BUSINESS.name,
    short_name: "Tixola",
    start_url: "/",
    display: "standalone",
    background_color: "#3b1613",
    theme_color: "#3b1613",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
