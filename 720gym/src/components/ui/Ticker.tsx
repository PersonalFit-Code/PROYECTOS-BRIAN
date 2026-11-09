"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cinta en bucle continuo: las frases se repiten sin cortes, a velocidad de lectura, y se paran al
 * pasar el ratón o con su botón (WCAG 2.2.2). Sustituye a la frase gigante que no se llegaba a leer.
 */
export default function Ticker({
  frases,
  tono = "oscuro",
  sentido = 1,
  duracion = 45,
  grande = false,
  className,
}: {
  frases: string[];
  tono?: "oscuro" | "claro";
  sentido?: 1 | -1;
  duracion?: number;
  grande?: boolean;
  className?: string;
}) {
  const [pausada, setPausada] = useState(false);
  const bloque = (oculto: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={oculto || undefined}>
      {frases.map((f, i) => (
        <li key={i} className="flex items-center">
          <span className={cn("titular whitespace-nowrap px-6", grande ? "text-[clamp(1.6rem,3.2vw,2.6rem)]" : "text-[clamp(1rem,1.6vw,1.25rem)]", i % 2 === 1 && grande && "opacity-45")}>{f}</span>
          <span className={cn("select-none", grande ? "text-[20px]" : "text-[12px]", "opacity-40")} aria-hidden>
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className={cn("cinta-caja relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]", tono === "oscuro" ? "text-white" : "text-negro", className)}
      data-pausada={pausada}
    >
      <div className="cinta" data-sentido={sentido} style={{ ["--cinta-duracion" as string]: `${duracion}s` }}>
        {bloque(false)}
        {bloque(true)}
      </div>
      <button
        type="button"
        onClick={() => setPausada((v) => !v)}
        aria-label={pausada ? "Reanudar la cinta" : "Pausar la cinta"}
        className={cn(
          "absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full opacity-0 transition-opacity focus-visible:opacity-100 [.cinta-caja:hover_&]:opacity-100",
          tono === "oscuro" ? "bg-white/10 text-white" : "bg-black/5 text-negro",
        )}
      >
        {pausada ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
      </button>
    </div>
  );
}
