import { Anton, Inter, Poppins } from "next/font/google";

/* next/font descarga las fuentes al compilar y las sirve desde el propio dominio, con
   `font-display: swap` y precarga: sin peticiones a Google desde el navegador. */
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/* La letra del logo (geométrica, como la de su insignia). Solo dos pesos. */
const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-logo", display: "swap" });

export const fontVariables = `${anton.variable} ${inter.variable} ${poppins.variable}`;
