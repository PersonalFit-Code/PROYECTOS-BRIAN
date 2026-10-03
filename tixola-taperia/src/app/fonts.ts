import { Cormorant_Garamond, Cinzel, Manrope, Bebas_Neue, Niconne } from "next/font/google";

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

/* Niconne: la letra manuscrita del LOGOTIPO. No es un adorno elegido por gusto — es la que firma la
   carta de papel y el rótulo, y de las treinta manuscritas que se compararon contra el archivo del
   logo es la que clava las formas: la "T" de brazo curvo, la "x" con el lazo y la cola, y el mismo
   contraste entre trazo grueso y fino. Un solo peso y solo donde el nombre de la casa aparece como
   nombre (cabecera y palabra acentuada del titular): en texto corrido una manuscrita no se lee.
   Un woff2 de 15 kB. */
const niconne = Niconne({ subsets: ["latin"], weight: "400", variable: "--font-niconne", display: "swap" });

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });

/** Clases de variables CSS para el `<html>`: `${cormorant.variable} ${cinzel.variable} …`. */
export const fontVariables = `${cormorant.variable} ${cinzel.variable} ${niconne.variable} ${manrope.variable} ${bebas.variable}`;
