import { Barlow_Condensed, Poppins } from "next/font/google";

/* Poppins, la letra de la marca, para el texto. Barlow Condensed para los titulares: estrecha y
   gruesa, como los de Gymshark (referencia de Jose). Autoalojadas por next/font. */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const fontVariables = `${poppins.variable} ${barlow.variable}`;
