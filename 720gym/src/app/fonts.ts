import { Big_Shoulders, Big_Shoulders_Stencil, Inter, Nunito_Sans } from "next/font/google";

/*
 * Tipografía de la guía de marca (comercial/720gym/MARCA.md §2):
 *  - Big Shoulders Stencil (óptica Display, opsz 72): titulares grandes, como el «720 GYM» del logo.
 *  - Big Shoulders (sin cortes): subtítulos y botones, legible en pequeño.
 *  - Inter: texto.
 *  - Nunito Sans ExtraBold: el detalle «CLUB» del logo, redondeado.
 * Autoalojadas por next/font: no hay peticiones a Google desde el navegador.
 */
export const stencil = Big_Shoulders_Stencil({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-stencil",
  display: "swap",
});

export const display = Big_Shoulders({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-display-f",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const club = Nunito_Sans({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-club",
  display: "swap",
});

export const fontVariables = `${stencil.variable} ${display.variable} ${inter.variable} ${club.variable}`;
