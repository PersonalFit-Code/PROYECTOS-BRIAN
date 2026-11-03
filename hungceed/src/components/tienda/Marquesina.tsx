"use client";

import Marquee from "@/components/ui/Marquee";

/** Carril bajo la portada: las series en titular estrecho, sobre blanco, separadas por un punto. */
const ITEMS = ["Elite Series", "Pro Series", "Prelude Series", "Attachment Series", "Envío 48–72 h", "Garantía 30 días"];

export default function Marquesina() {
  return (
    <div className="border-b border-linea bg-white py-4 text-negro">
      <Marquee pauseOnHover repeat={3} fade={false} className="[--duration:50s] [--gap:2.5rem]">
        {ITEMS.map((texto) => (
          <span key={texto} className="flex items-center gap-10">
            <span className="subtitular text-[22px] whitespace-nowrap">{texto}</span>
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-gris-claro" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
