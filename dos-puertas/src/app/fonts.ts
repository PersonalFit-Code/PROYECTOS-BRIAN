import { Playfair_Display, Cinzel, Pirata_One, Inter, Bebas_Neue } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-playfair", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-cinzel", display: "swap" });
/* La letra del rótulo de la fachada (ver globals.css). */
const pirata = Pirata_One({ subsets: ["latin"], weight: "400", variable: "--font-pirata", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });

export const fontVariables = `${playfair.variable} ${cinzel.variable} ${pirata.variable} ${inter.variable} ${bebas.variable}`;
