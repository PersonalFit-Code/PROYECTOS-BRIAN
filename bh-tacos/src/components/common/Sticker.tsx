import type { ReactNode } from "react";
import { cn } from "@/lib/format";

type Tone = "gold" | "brand" | "salsa" | "ink";

const TONES: Record<Tone, string> = {
  gold: "bg-gold text-ink",
  brand: "bg-brand text-ink",
  salsa: "bg-[#1f7a6f] text-white",
  ink: "bg-ink text-snow",
};

interface Props {
  children: ReactNode;
  tone?: Tone;
  /** Giro en grados: las pegatinas nunca van rectas. */
  rotate?: number;
  className?: string;
}

/** Etiqueta adhesiva de street food: borde blanco, sombra dura y un poco torcida. */
export default function Sticker({ children, tone = "gold", rotate = -3, className }: Props) {
  return (
    <span
      className={cn("sticker inline-flex items-center gap-1 whitespace-nowrap font-display uppercase tracking-wide", TONES[tone], className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
