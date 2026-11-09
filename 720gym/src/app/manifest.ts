import type { MetadataRoute } from "next";

/** Para «Añadir a pantalla de inicio» (web y panel de gestión). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "720 GYM CLUB",
    short_name: "720 GYM",
    description: "Gimnasio con aforo limitado en Ourense, abierto los 365 días.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0e0f",
    theme_color: "#0e0e0f",
    lang: "es",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
