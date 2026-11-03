"use client";

import { Cog, Dumbbell, Gauge, ShieldCheck, Truck, Wrench, type LucideIcon } from "lucide-react";
import Marquee from "@/components/ui/Marquee";

/** Carril bajo la portada (reciclado de la plantilla): series y garantías, con un icono distinto entre cada una. */
const ITEMS: { texto: string; icono: LucideIcon }[] = [
  { texto: "Elite Series", icono: Dumbbell },
  { texto: "Pro Series", icono: Gauge },
  { texto: "Prelude Series", icono: Cog },
  { texto: "Attachment Series", icono: Wrench },
  { texto: "Envío 48–72 h", icono: Truck },
  { texto: "Garantía 30 días", icono: ShieldCheck },
];

export default function Marquesina() {
  return (
    <div className="bg-rojo py-3.5 text-white">
      <Marquee pauseOnHover repeat={3} fade={false} className="[--duration:45s] [--gap:2rem]">
        {ITEMS.map(({ texto, icono: Icono }) => (
          <span key={texto} className="flex items-center gap-8">
            <span className="text-[13px] font-bold tracking-[0.2em] whitespace-nowrap uppercase">{texto}</span>
            <Icono aria-hidden strokeWidth={2} className="size-4 shrink-0 opacity-80" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
