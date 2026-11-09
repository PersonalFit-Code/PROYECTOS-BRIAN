import { Dumbbell, Flame, Flower2, Sun, UserCheck, Weight, type LucideProps } from "lucide-react";
import type { Concepto } from "@/data/conceptos";

const mapa = { dumbbell: Dumbbell, "user-check": UserCheck, flower: Flower2, sun: Sun, weight: Weight, flame: Flame } as const;

export default function IconoConcepto({ icono, ...props }: { icono: Concepto["icono"] } & LucideProps) {
  const Icono = mapa[icono];
  return <Icono aria-hidden {...props} />;
}
