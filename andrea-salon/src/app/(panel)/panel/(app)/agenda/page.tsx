import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import Rejilla from "@/components/panel/agenda/Rejilla";
import { desplazarFechaLocal } from "@/lib/booking";
import { fechaLarga } from "@/lib/fechas";
import { cargarAgenda } from "@/lib/panel/agenda";
import { columnasDia, columnasSemana, fechaValida, hoyLocal, lunesDe } from "@/lib/panel/columnas";
import { requireSesion } from "@/lib/panel/sesion";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agenda" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AgendaPage({ searchParams }: Props) {
  const s = await requireSesion();
  const q = await searchParams;
  const hoy = hoyLocal();
  const fecha = fechaValida(q.fecha) ?? hoy;
  const vista = q.vista === "semana" ? "semana" : "dia";

  const base = vista === "semana" ? lunesDe(fecha) : fecha;
  // Sin filtrar por profesional: la semana filtra al construir columnas y así los botones de
  // profesional salen de la misma consulta.
  const agenda = await cargarAgenda(s, base, { dias: vista === "semana" ? 7 : 1 });
  const quien = s.role === "owner" ? (q.quien ?? agenda.columnas[0]?.id ?? null) : s.staffId;

  const columnas =
    vista === "semana" && quien ? await columnasSemana(agenda, base, quien) : columnasDia(agenda, fecha);

  const paso = vista === "semana" ? 7 : 1;
  const enlace = (f: string, v = vista, qq = quien) =>
    `/panel/agenda?fecha=${f}&vista=${v}${v === "semana" && qq ? `&quien=${qq}` : ""}`;

  const titulo =
    vista === "semana" ? `Semana del ${fechaLarga(`${base}T12:00:00Z`)}` : fechaLarga(`${fecha}T12:00:00Z`);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold first-letter:uppercase">{titulo}</h1>
          {fecha !== hoy && (
            <Link href={enlace(hoy)} className="text-sm font-semibold text-carmin">
              Ir a hoy
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={enlace(desplazarFechaLocal(base, -paso))} aria-label="Anterior" className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-carmin/15 hover:ring-carmin/40">
            <ChevronLeft aria-hidden className="size-5" />
          </Link>
          <Link href={enlace(desplazarFechaLocal(base, paso))} aria-label="Siguiente" className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-carmin/15 hover:ring-carmin/40">
            <ChevronRight aria-hidden className="size-5" />
          </Link>
          <Link href={`/panel/citas/nueva?fecha=${fecha}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-carmin px-4 text-sm font-semibold text-white">
            <Plus aria-hidden className="size-4" /> Cita
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-carmin/15">
          {(["dia", "semana"] as const).map((v) => (
            <Link
              key={v}
              href={enlace(fecha, v)}
              aria-current={vista === v ? "page" : undefined}
              className={cn("min-h-9 rounded-full px-4 py-1.5 text-sm font-semibold", vista === v ? "bg-carmin text-white" : "text-tinta")}
            >
              {v === "dia" ? "Día" : "Semana"}
            </Link>
          ))}
        </div>
        {vista === "semana" && s.role === "owner" && (
          <div className="flex flex-wrap gap-1">
            {agenda.columnas.map((c) => (
                <Link
                  key={c.id}
                  href={enlace(fecha, "semana", c.id)}
                  className={cn("min-h-9 rounded-full px-3 py-1.5 text-sm", quien === c.id ? "bg-tinta text-white" : "bg-white ring-1 ring-carmin/15")}
                >
                  {c.nombre}
                </Link>
              ))}
          </div>
        )}
      </div>

      <Rejilla columnas={columnas} abre={agenda.abre} cierra={agenda.cierra} ahora={fecha === hoy && vista === "dia" ? new Date().toISOString() : undefined} />
    </div>
  );
}
