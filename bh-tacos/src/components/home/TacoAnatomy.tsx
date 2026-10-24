"use client";

import { useState } from "react";
import { HOME } from "@/content";
import { cn } from "@/lib/format";

type LayerId = (typeof HOME.whatIs.layers)[number]["id"];

/* Vista explotada: cada capa a su altura. y = centro vertical de la capa (para el tooltip). */
const GEOMETRY: Record<LayerId, { y: number }> = {
  gratinado: { y: 40 },
  tortilla: { y: 92 },
  salsa: { y: 146 },
  carne: { y: 196 },
  patatas: { y: 248 },
  plancha: { y: 304 },
};

function Layer({ id }: { id: LayerId }) {
  switch (id) {
    case "gratinado":
      return (
        <g>
          <path d="M70 46c30-22 70-6 100-12s70-12 100 0 40 8 50 14l-4 10c-30-6-60 2-90 0s-70 6-100 2-40 0-60 4z" fill="#FFF1C9" stroke="#E8C66B" strokeWidth="2" />
          <path d="M120 52q4 14 0 22M230 50q4 12 0 18" stroke="#FFF1C9" strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "tortilla":
      return (
        <g>
          <rect x="60" y="76" width="280" height="32" rx="14" fill="#F2B572" />
          <path d="M100 98l14-12m36 12l14-12m36 12l14-12m36 12l14-12m36 12l14-12" stroke="#B5682A" strokeWidth="4" strokeLinecap="round" opacity=".55" />
        </g>
      );
    case "salsa":
      return (
        <g>
          <path d="M66 140c40-14 80 10 120-2s80 10 120-2 30 6 34 4v14c-50 6-100 2-140 4s-90-4-134-2z" fill="#FFC94A" />
          <path className="anim-drip" d="M150 158c-5 0-7 5-7 10 0 8 7 16 7 22 0-6 7-14 7-22 0-5-2-10-7-10z" fill="#FFC94A" />
        </g>
      );
    case "carne":
      return (
        <g>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={70 + i * 34} y={i % 2 ? 186 : 182} width="30" height="22" rx="9" fill={["#E9B872", "#7A3E2A", "#F2D49B", "#C9822E"][i % 4]} />
          ))}
        </g>
      );
    case "patatas":
      return (
        <g>
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={72 + i * 25} y="232" width="10" height="34" rx="3" fill="#FFD166" stroke="#E2A93B" strokeWidth="1.5" transform={`rotate(${i % 2 ? 8 : -7} ${77 + i * 25} 249)`} />
          ))}
        </g>
      );
    case "plancha":
      return (
        <g>
          <rect x="50" y="292" width="300" height="26" rx="8" fill="#3B3633" />
          <path d="M70 300h260M70 310h260" stroke="#E63946" strokeWidth="3" opacity=".7" />
          <path className="anim-sizzle" style={{ transformBox: "fill-box" }} d="M120 286c-5-7 5-12 0-18M200 286c-5-7 5-12 0-18M280 286c-5-7 5-12 0-18" stroke="currentColor" strokeOpacity=".4" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

/**
 * Diagrama anatómico interactivo: SVG por capas + leyenda de botones. Pasar el ratón, tocar o
 * enfocar con el teclado una capa (en el dibujo o en la leyenda) la resalta y muestra su tooltip.
 * Primer tooltip con entrada de 150 ms; los siguientes cambian al instante (Emil: sin retardo
 * en tooltips consecutivos).
 */
export default function TacoAnatomy() {
  const layers = HOME.whatIs.layers;
  const [active, setActive] = useState<LayerId | null>(null);
  const current = layers.find((l) => l.id === active);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative text-fg" onPointerLeave={() => setActive(null)}>
        <svg viewBox="0 0 400 330" className="h-auto w-full" role="group" aria-label="Diagrama de las capas de un French taco">
          {layers.map((l) => (
            <g
              key={l.id}
              tabIndex={-1}
              onPointerEnter={() => setActive(l.id)}
              onClick={() => setActive(l.id)}
              className="cursor-pointer"
              style={{
                opacity: active && active !== l.id ? 0.35 : 1,
                transform: active === l.id ? "translateX(-6px) scale(1.02)" : "none",
                transformOrigin: `200px ${GEOMETRY[l.id].y}px`,
                transition: "opacity 160ms ease, transform 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <Layer id={l.id} />
            </g>
          ))}
        </svg>
        {current && (
          <div
            role="tooltip"
            id="anatomy-tip"
            data-open="true"
            className="tip card absolute right-0 z-10 w-56 p-3 text-sm shadow-xl sm:-right-4"
            style={{ top: `${(GEOMETRY[current.id].y / 330) * 100}%`, transform: "translateY(-50%)", transition: "top 150ms cubic-bezier(0.23, 1, 0.32, 1)" }}
          >
            <p className="font-display text-base uppercase text-brand-text">{current.label}</p>
            <p className="mt-1 text-fg-muted">{current.detail}</p>
          </div>
        )}
      </div>

      <div>
      <p className="mb-3 text-sm text-fg-muted">Pasa el ratón, toca o tabula por las capas para verlas por dentro.</p>
      <ol className="grid gap-2" aria-label="Capas del taco">
        {layers.map((l, i) => (
          <li key={l.id}>
            <button
              type="button"
              onPointerEnter={() => setActive(l.id)}
              onFocus={() => setActive(l.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(l.id)}
              aria-describedby={active === l.id ? "anatomy-tip" : undefined}
              className={cn(
                "press flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left",
                active === l.id ? "border-brand bg-surface-2" : "border-line bg-surface",
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand font-display text-white">{i + 1}</span>
              <span className="font-semibold">{l.label}</span>
            </button>
          </li>
        ))}
      </ol>
      </div>
    </div>
  );
}
