import type { MetadataRoute } from "next";
import { APP_NOMBRE } from "@/lib/marca";

/** Manifiesto de la PWA: con esto, "Añadir a pantalla de inicio" la abre como una app, sin barra del navegador. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NOMBRE,
    short_name: APP_NOMBRE,
    description: "Tu plan de vida: metas, finanzas, hábitos y diario, con un coach que te empuja.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#191919",
    theme_color: "#191919",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Hoy", url: "/hoy" },
      { name: "Apuntar gasto", url: "/finanzas?nuevo=1" },
      { name: "Hábitos", url: "/habitos" },
    ],
  };
}
