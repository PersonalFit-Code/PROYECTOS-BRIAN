"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * En el móvil, un apartado de la portada se queda en una barra («desplegar opciones») y se abre al
 * tocarla; en escritorio se ve siempre abierto y la barra no aparece. El contenido está siempre en
 * el HTML (bueno para Google) y se abre con una transición de altura.
 */
export default function PlegableMovil({ titulo, resumen, icono, children }: { titulo: string; resumen?: string; icono: ReactNode; children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  return (
    <div className="plegable" data-abierto={abierto}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-controls={id}
        className="plegable-barra group flex w-full items-center gap-4 border-t border-white/10 bg-negro px-5 py-4 text-left text-white lg:hidden"
      >
        <span className="icono-salta grid size-11 shrink-0 place-items-center rounded-2xl bg-white/[0.08] ring-1 ring-white/10 transition group-active:scale-90">{icono}</span>
        <span className="min-w-0 flex-1">
          <span className="subtitular block text-[17px]">{titulo}</span>
          {resumen && <span className="block truncate text-[12.5px] text-white/55">{resumen}</span>}
        </span>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-white text-negro transition duration-500", abierto && "rotate-180")}>
          <ChevronDown className="size-4" aria-hidden />
        </span>
      </button>
      <div id={id} className="plegable-cuerpo">
        <div className="min-h-0 overflow-hidden lg:overflow-visible">{children}</div>
      </div>
    </div>
  );
}
