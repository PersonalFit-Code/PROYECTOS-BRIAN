import { Dumbbell, Sun, UserCheck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { Concepto } from "@/data/conceptos";
import { BarraDiscos, Kettlebell, Reformer } from "./IconosMarca";

/** Icono de cada concepto (los mismos que en «El universo 720»). */
type Icono = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
const mapa: Record<Concepto["icono"], Icono> = {
  dumbbell: Dumbbell as Icono,
  "user-check": UserCheck as Icono,
  flower: Reformer,
  sun: Sun as Icono,
  weight: BarraDiscos,
  flame: Kettlebell,
};

export default function IconoConcepto({ icono, className }: { icono: Concepto["icono"]; className?: string }) {
  const I = mapa[icono];
  return <I className={className} aria-hidden />;
}
