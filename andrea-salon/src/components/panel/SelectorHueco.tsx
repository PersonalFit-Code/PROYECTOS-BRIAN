"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { huecosPanel } from "@/app/(panel)/panel/(app)/citas/acciones";
import { horaSalon } from "@/components/reservar/api";
import { cn } from "@/lib/utils";

/**
 * Elegir día y hora en el panel con el MISMO motor que la web (sin antelación mínima y con los
 * servicios que no se reservan online). Devuelve el hueco elegido; la acción final la hace quien
 * lo usa (crear o mover).
 */
export interface HuecoPanel {
  inicio: string;
  staffId: string;
  candidatas: string[];
}

export default function SelectorHueco({
  servicios,
  staffId,
  fechaInicial,
  elegido,
  onElegir,
}: {
  servicios: string[];
  staffId: string | null;
  fechaInicial: string;
  elegido: string | null;
  onElegir: (h: HuecoPanel | null, fecha: string) => void;
}) {
  const [fecha, setFecha] = useState(fechaInicial);
  const [estado, setHuecos] = useState<{ clave: string; lista: HuecoPanel[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();
  const clave = `${servicios.join(",")}|${staffId ?? ""}|${fecha}`;
  // Solo vale la lista que corresponde a lo elegido ahora; una vieja no se enseña.
  const huecos = servicios.length > 0 && estado?.clave === clave ? estado.lista : null;

  useEffect(() => {
    if (servicios.length === 0) return;
    // Fuera del cuerpo del effect: si cambian servicios o día otra vez, la consulta vieja ni sale.
    const t = window.setTimeout(() => {
      empezar(async () => {
        const r = await huecosPanel({ servicios, staffId, fecha });
        if (r.ok) {
          setHuecos({ clave, lista: r.datos ?? [] });
          setError(null);
        } else {
          setHuecos({ clave, lista: [] });
          setError(r.error);
        }
      });
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `clave` resume servicios, profesional y día
  }, [clave]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold">
        Día
        <input
          type="date"
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            onElegir(null, e.target.value);
          }}
          className="mt-1.5 block min-h-12 w-full rounded-2xl border border-carmin/20 bg-white px-4 text-[16px]"
        />
      </label>
      {servicios.length === 0 && <p className="text-sm text-gris">Elige primero los servicios.</p>}
      {pendiente && (
        <p className="flex items-center gap-2 text-sm text-gris" role="status">
          <Loader2 aria-hidden className="size-4 animate-spin" /> Mirando la agenda…
        </p>
      )}
      {error && <p className="text-sm text-carmin">{error}</p>}
      {huecos && huecos.length === 0 && !error && !pendiente && <p className="text-sm text-gris">Ese día no quedan huecos. Puedes poner la hora a mano.</p>}
      {huecos && huecos.length > 0 && (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {huecos.map((h) => (
            <li key={h.inicio}>
              <button
                type="button"
                onClick={() => onElegir(h, fecha)}
                aria-pressed={elegido === h.inicio}
                className={cn(
                  "min-h-11 w-full rounded-xl text-sm font-semibold tabular-nums ring-1",
                  elegido === h.inicio ? "bg-carmin text-white ring-carmin" : "bg-white ring-carmin/15 hover:ring-carmin/50",
                )}
              >
                {horaSalon(h.inicio)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
