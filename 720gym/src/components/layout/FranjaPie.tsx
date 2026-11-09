"use client";

import { usePathname } from "next/navigation";
import FranjaCta from "@/components/ui/FranjaCta";

/** Encima del pie de cada página interior: una última puerta a inscribirse o escribir por WhatsApp. */
const frases: Record<string, { frase: string; detalle: string }> = {
  "/horario": { frase: "¿Ya tienes tu clase?", detalle: "Inscríbete y reserva plaza desde el móvil." },
  "/tarifas": { frase: "Elige plan y empieza hoy", detalle: "Alta online en un minuto, pago seguro." },
  "/contacto": { frase: "Mejor, pásate a entrenar", detalle: "Inscríbete o pide tu clase de prueba gratis." },
};

export default function FranjaPie() {
  const ruta = usePathname();
  if (ruta === "/" || ruta.startsWith("/alta") || ruta.startsWith("/panel") || ruta.startsWith("/clase-gratis")) return null;
  const f = frases[ruta] ?? { frase: "¿Empezamos?", detalle: "Inscríbete en un minuto o escríbenos por WhatsApp." };
  return <FranjaCta frase={f.frase} detalle={f.detalle} />;
}
