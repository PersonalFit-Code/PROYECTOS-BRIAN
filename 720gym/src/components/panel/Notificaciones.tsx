"use client";

import { Bot, CalendarCheck, CreditCard, FileText, Flame, Inbox, Siren, X } from "lucide-react";
import { hace, euros, useAhora } from "./ui";
import { useDatosVivos } from "./datos";
import { solicitudesSemilla } from "@/data/panel-demo";
import type { Seccion } from "./Panel";

export interface Aviso {
  id: string;
  texto: string;
  detalle: string;
  cuando: string;
  fecha: number;
  seccion: Seccion;
  Icono: typeof Inbox;
}

const tipoTexto = { prueba: "Clase de prueba", inscripcion: "Inscripción", entrada: "Entrada diaria" } as const;

/** Lo último que ha pasado en la web (reservas, solicitudes, pagos, chats) + ejemplos de partida. */
export function useAvisos(): Aviso[] {
  const ahora = useAhora();
  const { reservas, solicitudes, pagos, chats, fichas, alertas, planes } = useDatosVivos();
  const vivos: Aviso[] = [
    ...solicitudes.map((s) => ({ id: s.id, texto: `${tipoTexto[s.tipo]} · ${s.nombre}`, detalle: s.actividad ?? s.plan ?? "Desde la web", cuando: s.creada, seccion: "solicitudes" as Seccion, Icono: Inbox })),
    ...reservas.map((r) => ({ id: r.id, texto: `Reserva · ${r.nombre}`, detalle: `${r.clase} · ${r.dia} ${r.hora}`, cuando: r.creada, seccion: "calendario" as Seccion, Icono: CalendarCheck })),
    ...pagos.map((p) => ({ id: p.id, texto: `Pago online · ${euros(p.importe)}`, detalle: `${p.concepto} · ${p.nombre}`, cuando: p.creada, seccion: "movimientos" as Seccion, Icono: CreditCard })),
    ...alertas.map((a) => ({ id: a.id, texto: `${a.urgencia === "alta" ? "URGENTE · " : ""}Aviso del asistente`, detalle: a.resumen, cuando: a.creada, seccion: "solicitudes" as Seccion, Icono: Siren })),
    ...fichas.filter((f) => f.temperatura === "caliente").map((f) => ({ id: `f${f.id}`, texto: `Cliente caliente · ${f.nombre ?? "sin nombre"}`, detalle: f.siguiente_paso, cuando: f.creada, seccion: "solicitudes" as Seccion, Icono: Flame })),
    ...planes.map((p) => ({ id: p.id, texto: `Plan de 4 semanas · ${p.nombre}`, detalle: `${p.objetivo} · ${p.telefono}`, cuando: p.creada, seccion: "solicitudes" as Seccion, Icono: FileText })),
    ...chats.map((c) => ({ id: c.id, texto: "Conversación con el asistente", detalle: `${c.mensajes.length} mensajes`, cuando: c.inicio, seccion: "asistente" as Seccion, Icono: Bot })),
  ].map((a) => ({ ...a, fecha: new Date(a.cuando).getTime(), cuando: hace(a.cuando, ahora) }));
  vivos.sort((a, b) => b.fecha - a.fecha);
  const ejemplos: Aviso[] = solicitudesSemilla.slice(0, 3).map((s) => ({ id: s.id, texto: `${tipoTexto[s.tipo]} · ${s.nombre}`, detalle: s.actividad, cuando: s.hace, fecha: 0, seccion: "solicitudes", Icono: Inbox }));
  return [...vivos.slice(0, 8), ...ejemplos];
}

export default function Notificaciones({ avisos, vistoHasta, onIr, onCerrar, onLeer }: { avisos: Aviso[]; vistoHasta: number; onIr: (s: Seccion) => void; onCerrar: () => void; onLeer: () => void }) {
  return (
    <div className="panel-vidrio panel-flotante pop-entra fixed top-[84px] right-3 z-50 w-[min(360px,calc(100vw-24px))] rounded-[22px] p-3" role="dialog" aria-label="Notificaciones">
      <div className="flex items-center justify-between px-2 pt-1 pb-2">
        <p className="subtitular text-[16px]">Notificaciones</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onLeer} className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-negro/60 hover:bg-black/[0.06] hover:text-negro">
            Marcar leídas
          </button>
          <button type="button" onClick={onCerrar} className="grid size-8 place-items-center rounded-full hover:bg-black/[0.06]" aria-label="Cerrar notificaciones">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      <ul className="grid max-h-[60vh] gap-1 overflow-y-auto">
        {avisos.map(({ id, texto, detalle, cuando, fecha, seccion, Icono }) => {
          const nuevo = fecha > vistoHasta;
          return (
            <li key={id}>
              <button type="button" onClick={() => onIr(seccion)} className="flex w-full items-start gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-white/70">
                <span className={`grid size-9 shrink-0 place-items-center rounded-full ${nuevo ? "bg-negro text-white" : "bg-black/[0.06]"}`}>
                  <Icono className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{texto}</span>
                  <span className="block truncate text-[12px] text-negro/55">{detalle}</span>
                </span>
                <span className="shrink-0 text-[11px] text-negro/45">{cuando}</span>
                {nuevo && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-negro" aria-label="Nueva" />}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="px-2 pt-2 text-[11px] text-negro/45">Lo que pasa en la web aparece aquí al momento.</p>
    </div>
  );
}
