"use client";

import { usePathname } from "next/navigation";
import FranjaCta from "@/components/ui/FranjaCta";

/** Encima del pie de cada página interior: una última puerta a inscribirse o escribir por WhatsApp. */
const frases: Record<string, { frase: string; detalle: string }> = {
  "/horario": { frase: "¿Ya tienes tu clase?", detalle: "Escríbenos y te orientamos sobre el grupo que mejor te encaja." },
  "/tarifas": { frase: "¿Hablamos?", detalle: "Cuéntanos qué buscas y te orientamos." },
  "/contacto": { frase: "Mejor, pásate a entrenar", detalle: "Escríbenos y concertamos una visita." },
};

export default function FranjaPie() {
  const ruta = usePathname();
  if (ruta === "/" || ruta.startsWith("/alta") || ruta.startsWith("/panel") || ruta.startsWith("/clase-gratis")) return null;
  const f = frases[ruta] ?? { frase: "¿Hablamos?", detalle: "Cuéntanos qué buscas y concertamos una visita." };
  return <FranjaCta frase={f.frase} detalle={f.detalle} />;
}
