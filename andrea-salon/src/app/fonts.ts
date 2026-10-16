import { Bodoni_Moda, Inter } from "next/font/google";

/**
 * Fuentes de la web, en un módulo aparte porque las cargan DOS raíces distintas:
 * `app/[locale]/layout.tsx` (el layout raíz del sitio) y `app/not-found.tsx` (el 404, que al estar
 * por encima del layout de idioma tiene que pintar su propio `<html>`/`<body>`). Una sola llamada
 * a `next/font` por familia = un solo juego de woff2 y las mismas variables CSS en ambas.
 *
 * Autoalojadas por `next/font`: no se conecta con Google Fonts en ninguna visita (lo dice la
 * política de cookies, así que tiene que seguir siendo verdad).
 */

/* Bodoni Moda: los titulares de la línea editorial (tipo revista de moda). Es variable: un solo
   fichero da todos los pesos y el tamaño óptico; con la itálica, que acentúa una palabra. */
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

/* Inter: texto corrido, botones y formularios de la reserva. */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/** Clases de variables CSS para el `<html>`. */
export const fontVariables = `${bodoni.variable} ${inter.variable}`;
