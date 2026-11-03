import { Poppins } from "next/font/google";

/* Poppins, la letra de la marca. Autoalojada por next/font: ninguna visita conecta con Google. */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const fontVariables = poppins.variable;
