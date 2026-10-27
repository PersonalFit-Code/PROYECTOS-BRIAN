import type { MetadataRoute } from "next";

/* Para que Adrián la pueda «Añadir a pantalla de inicio» y se abra como una app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Estudio Adrián",
    short_name: "Incendios",
    description: "Test por temas, examen con tiempo y repaso de fallos.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f5fa",
    theme_color: "#1f4fd8",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
