import { Barlow_Condensed, Big_Shoulders_Stencil, Inter } from "next/font/google";

/*
 * Tipografía. Brian (09/11): nada de letra «partida» en los titulares; elegante y seria, en la línea
 * de Hungceed y Gymshark. Por eso:
 *  - Barlow Condensed (700/800): titulares, botones y cifras. Estrecha, maciza y limpia.
 *  - Inter: texto.
 *  - Big Shoulders Stencil: SOLO en el logo y en las marcas «720 ___» de las submarcas, que es su
 *    letra de marca (su logo es stencil).
 * Autoalojadas por next/font: el navegador no pide nada a Google.
 */
export const barlow = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const stencil = Big_Shoulders_Stencil({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-stencil",
  display: "swap",
});

export const fontVariables = `${barlow.variable} ${inter.variable} ${stencil.variable}`;
