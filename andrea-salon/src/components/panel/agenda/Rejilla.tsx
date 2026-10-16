import Link from "next/link";
import { enZona } from "@/lib/booking";
import { formatCents } from "@/lib/format";
import { ZONA_SALON } from "@/lib/fechas";
import type { AusenciaAgenda, CitaAgenda } from "@/lib/panel/agenda";
import { cn } from "@/lib/utils";

/**
 * Rejilla de agenda: una columna por profesional (vista día) o por día (vista semana), filas de
 * 15 minutos y las citas colocadas en absoluto según su hora. CSS puro, sin librería de calendario:
 * pesa nada, se imprime bien y se entiende en el móvil con scroll horizontal por columnas.
 *
 * El color de la izquierda es el de la profesional; el punto, el semáforo de asistencia:
 * verde = ha dicho «Sí, voy»; ámbar = aún no ha contestado; gris = ya hecha o no vino (tachada).
 * El color nunca va solo: cada cita lleva su estado y su profesional en texto para el lector de
 * pantalla, porque la columna de arriba no se lee al recorrer las citas con el tabulador.
 */
export interface ColumnaRejilla {
  id: string;
  titulo: string;
  subtitulo?: string;
  color: string;
  /** minutos desde medianoche en que la columna está abierta */
  franjas: { desde: number; hasta: number }[];
  citas: CitaAgenda[];
  ausencias: AusenciaAgenda[];
  /** inicio del día de la columna (para recortar ausencias de varios días) */
  diaDesde: string;
  diaHasta: string;
}

const PX_MIN = 1.6;

function minutosLocales(iso: string): number {
  const h = enZona(new Date(iso), ZONA_SALON);
  return h.hora * 60 + h.minuto;
}

function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export default function Rejilla({ columnas, abre, cierra, ahora }: { columnas: ColumnaRejilla[]; abre: number; cierra: number; ahora?: string }) {
  const alto = (cierra - abre) * PX_MIN;
  const horas: number[] = [];
  for (let m = abre; m <= cierra; m += 60) horas.push(m);
  const minAhora = ahora ? minutosLocales(ahora) : null;

  if (columnas.length === 0) {
    return <p className="rounded-3xl border border-[var(--capa-borde)] bg-white p-6 text-gris">No hay profesionales activas. Añádelas en Equipo.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-[var(--capa-borde)] bg-white">
      <div className="grid min-w-full" style={{ gridTemplateColumns: `56px repeat(${columnas.length}, minmax(150px, 1fr))` }}>
        <div className="sticky left-0 z-20 border-b border-[var(--capa-borde)] bg-white" />
        {columnas.map((c) => (
          <div key={c.id} className="border-b border-l border-[var(--capa-borde)] px-3 py-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: c.color }} />
              {c.titulo}
            </p>
            {c.subtitulo && <p className="text-xs text-gris">{c.subtitulo}</p>}
          </div>
        ))}

        <div className="relative sticky left-0 z-10 bg-white" style={{ height: alto }}>
          {horas.map((m) => (
            <span key={m} className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-gris" style={{ top: (m - abre) * PX_MIN }}>
              {hhmm(m)}
            </span>
          ))}
        </div>

        {columnas.map((c) => (
          <div key={c.id} className="relative border-l border-[var(--capa-borde)] bg-rosa-niebla/40" style={{ height: alto }}>
            {/* Horario abierto: fondo blanco; fuera de horario queda rosado. */}
            {c.franjas.map((f, i) => (
              <div key={i} aria-hidden className="absolute inset-x-0 bg-white" style={{ top: (f.desde - abre) * PX_MIN, height: (f.hasta - f.desde) * PX_MIN }} />
            ))}
            {horas.map((m) => (
              <div key={m} aria-hidden className="absolute inset-x-0 border-t border-dashed border-carmin/10" style={{ top: (m - abre) * PX_MIN }} />
            ))}
            {c.ausencias.map((a) => {
              const desde = a.inicio < c.diaDesde ? abre : Math.max(abre, minutosLocales(a.inicio));
              const hasta = a.fin > c.diaHasta ? cierra : Math.min(cierra, minutosLocales(a.fin));
              if (hasta <= desde) return null;
              return (
                <div
                  key={a.id}
                  className="absolute inset-x-1 rounded-xl bg-[repeating-linear-gradient(135deg,rgba(115,100,106,0.12)_0_6px,transparent_6px_12px)] px-2 py-1 text-[11px] text-tinta"
                  style={{ top: (desde - abre) * PX_MIN, height: (hasta - desde) * PX_MIN }}
                >
                  {a.motivo ?? (a.staffId ? "Ausencia" : "Salón cerrado")}
                </div>
              );
            })}
            {c.citas.map((cita) => {
              const ini = minutosLocales(cita.inicio);
              const fin = minutosLocales(cita.fin);
              const alto = Math.max((fin - ini) * PX_MIN, 30);
              return (
                <Link
                  key={cita.id}
                  href={`/panel/citas/${cita.id}`}
                  /* Hecha o falta: fondo apagado y sin sombra, pero el texto a contraste completo (con
                     opacidad bajaba a 2:1 y no se leía en el mostrador). */
                  className={cn(
                    "absolute inset-x-1 overflow-hidden rounded-xl border-l-4 px-2 py-1 text-left ring-1 transition-shadow hover:ring-carmin/40",
                    cita.estado === "done" || cita.estado === "no_show"
                      ? "bg-crema ring-carmin/5"
                      : "bg-white shadow-[var(--shadow-soft)] ring-carmin/10",
                    cita.estado === "no_show" && "line-through decoration-gris/70",
                  )}
                  style={{ top: (ini - abre) * PX_MIN, height: alto, borderLeftColor: c.color }}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold tabular-nums text-gris">
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 rounded-full",
                        cita.estado === "done" || cita.estado === "no_show" ? "bg-gris/50" : cita.asistenciaConfirmada ? "bg-emerald-500" : "bg-amber-400",
                      )}
                    />
                    {hhmm(ini)}
                    <span className="sr-only">
                      {cita.estado === "done"
                        ? ", hecha"
                        : cita.estado === "no_show"
                          ? ", no vino"
                          : cita.asistenciaConfirmada
                            ? ", asistencia confirmada"
                            : ", sin confirmar"}
                      {`, ${c.titulo}`}
                    </span>
                  </span>
                  <span className="block truncate text-[13px] font-semibold text-tinta">{cita.clienta?.nombre ?? "Sin clienta"}</span>
                  <span className="block truncate text-[11px] text-gris">
                    {cita.servicios.join(" + ")} · {formatCents(cita.totalCents)}
                  </span>
                </Link>
              );
            })}
            {minAhora !== null && minAhora >= abre && minAhora <= cierra && (
              <div aria-hidden className="absolute inset-x-0 z-10 border-t-2 border-carmin" style={{ top: (minAhora - abre) * PX_MIN }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
