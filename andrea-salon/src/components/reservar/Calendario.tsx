"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { DiaDisponible } from "./tipos";

/**
 * Calendario mensual de la reserva. Solo pinta lo que dice la API: un día es pulsable si
 * `hayHuecos`. Las fechas son "YYYY-MM-DD" civiles y se manejan con `Date.UTC` para que la zona del
 * navegador no corra ningún día.
 */
function partes(fecha: string) {
  const [a, m, d] = fecha.split("-").map(Number);
  return { a, m, d };
}

export default function Calendario({
  dias,
  seleccionada,
  onElegir,
}: {
  dias: DiaDisponible[];
  seleccionada: string | null;
  onElegir: (fecha: string) => void;
}) {
  const m = useMessages().reservar.dia;
  const t = useFormat();
  const porFecha = useMemo(() => new Map(dias.map((d) => [d.fecha, d.hayHuecos])), [dias]);

  const meses = useMemo(() => {
    const claves: string[] = [];
    for (const d of dias) {
      const clave = d.fecha.slice(0, 7);
      if (!claves.includes(clave)) claves.push(clave);
    }
    return claves;
  }, [dias]);

  const inicial = Math.max(0, seleccionada ? meses.indexOf(seleccionada.slice(0, 7)) : meses.findIndex((k) => dias.some((d) => d.hayHuecos && d.fecha.startsWith(k))));
  const [indice, setIndice] = useState(inicial === -1 ? 0 : inicial);
  const clave = meses[indice] ?? meses[0];
  if (!clave) return null;

  const { a, m: mes } = partes(`${clave}-01`);
  const primerDia = new Date(Date.UTC(a, mes - 1, 1)).getUTCDay(); // 0 domingo
  const huecosAntes = (primerDia + 6) % 7; // semana empieza en lunes
  const diasMes = new Date(Date.UTC(a, mes, 0)).getUTCDate();

  const celdas: (string | null)[] = [];
  for (let i = 0; i < huecosAntes; i++) celdas.push(null);
  for (let d = 1; d <= diasMes; d++) celdas.push(`${clave}-${String(d).padStart(2, "0")}`);

  return (
    <div className="rounded-[3px] border border-[var(--capa-borde)] bg-[var(--capa-2)] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label={m.anterior}
          className="grid size-11 place-items-center rounded-full text-carmin hover:bg-carmin/5 disabled:opacity-30"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <p className="font-display text-lg font-semibold text-tinta first-letter:uppercase" aria-live="polite">
          {m.meses[mes - 1]} {a}
        </p>
        <button
          type="button"
          onClick={() => setIndice((i) => Math.min(meses.length - 1, i + 1))}
          disabled={indice >= meses.length - 1}
          aria-label={m.siguiente}
          className="grid size-11 place-items-center rounded-full text-carmin hover:bg-carmin/5 disabled:opacity-30"
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-gris" aria-hidden>
        {m.semana.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      {/* Botones sueltos con etiqueta completa («jueves, 16 de octubre»), no `role="grid"`: un grid
          exige filas y celdas, y a medias confunde más al lector de pantalla que no ponerlo. */}
      <div className="grid grid-cols-7 gap-1">
        {celdas.map((fecha, i) => {
          if (!fecha) return <span key={`v${i}`} />;
          const enRango = porFecha.has(fecha);
          const libre = porFecha.get(fecha) === true;
          const activa = fecha === seleccionada;
          const dia = Number(fecha.slice(8));
          const diaSemana = m.diasLargos[new Date(Date.UTC(a, mes - 1, dia)).getUTCDay()] ?? "";
          return (
            <button
              key={fecha}
              type="button"
              disabled={!libre}
              onClick={() => onElegir(fecha)}
              aria-pressed={activa}
              aria-label={t(m.fechaFormato, { dia: diaSemana, n: dia, mes: m.meses[mes - 1] ?? "" })}
              className={cn(
                "aspect-square min-h-11 rounded-[3px] text-[15px] font-semibold transition-colors",
                activa && "bg-carmin text-[var(--on-accent)] shadow-[var(--shadow-soft)]",
                !activa && libre && "bg-white text-tinta ring-1 ring-carmin/15 hover:bg-rosa-niebla hover:ring-carmin/40",
                !libre && enRango && "text-gris/50 line-through decoration-gris/30",
                !enRango && "text-gris/30",
              )}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}
