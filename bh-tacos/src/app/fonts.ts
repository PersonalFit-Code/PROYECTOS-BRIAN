import { Anton, Inter } from "next/font/google";

/* next/font descarga las fuentes al compilar y las sirve desde el propio dominio, con
   `font-display: swap` y precarga: sin peticiones a Google desde el navegador. */
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const fontVariables = `${anton.variable} ${inter.variable}`;
