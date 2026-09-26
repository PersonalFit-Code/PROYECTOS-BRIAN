import { Cormorant_Garamond, Cinzel, Manrope, Bebas_Neue } from "next/font/google";

/**
 * Fuentes de la web, en un módulo aparte porque las cargan DOS raíces distintas:
 * `app/[locale]/layout.tsx` (el layout raíz del sitio) y `app/not-found.tsx` (el 404, que al estar
 * por encima del layout de idioma tiene que pintar su propio `<html>`/`<body>`). Una sola llamada
 * a `next/font` por familia = un solo juego de woff2 y las mismas variables CSS en ambas.
 */

/* Sin el peso 600: no se usa en ninguna clase `font-display` (los `font-semibold` del proyecto son
   todos `font-caps`/Cinzel). Son dos woff2 menos compitiendo con la portada en la primera carga. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });

/** Clases de variables CSS para el `<html>`: `${cormorant.variable} ${cinzel.variable} …`. */
export const fontVariables = `${cormorant.variable} ${cinzel.variable} ${manrope.variable} ${bebas.variable}`;
