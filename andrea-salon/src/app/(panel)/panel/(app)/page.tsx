import { AlertTriangle, CalendarPlus, Phone } from "lucide-react";
import Link from "next/link";
import Rejilla from "@/components/panel/agenda/Rejilla";
import { desplazarFechaLocal } from "@/lib/booking";
import { fechaLarga, hora } from "@/lib/fechas";
import { formatCents } from "@/lib/format";
import { cargarAgenda, cobradoEntre, rangoDias } from "@/lib/panel/agenda";
import { columnasDia, hoyLocal } from "@/lib/panel/columnas";
import { requireSesion } from "@/lib/panel/sesion";
import { formatearTelefonoES } from "@/lib/phone";

/**
 * Hoy: lo que Andrea mira al abrir el salón. Cuántas citas hay, cuánto se ha cobrado, qué queda
 * por cobrar (citas que ya pasaron y siguen sin cerrar) y quién no ha confirmado la de mañana, con
 * su teléfono a un toque. Debajo, la agenda del día.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "Hoy" };

export default async function HoyPage() {
  const s = await requireSesion();
  const hoy = hoyLocal();
  const manana = desplazarFechaLocal(hoy, 1);
  const ahora = new Date();
  const { desde, hasta } = rangoDias(hoy);

  const [agenda, agendaManana, cobrado] = await Promise.all([
    cargarAgenda(s, hoy),
    cargarAgenda(s, manana),
    cobradoEntre(desde, hasta),
  ]);

  const vivas = agenda.citas.filter((c) => c.estado !== "no_show");
  const porCobrar = agenda.citas.filter((c) => c.estado === "confirmed" && new Date(c.fin) < ahora);
  const sinConfirmar = agendaManana.citas.filter((c) => c.estado === "confirmed" && !c.asistenciaConfirmada);
  const previsto = vivas.reduce((t, c) => t + c.totalCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-carmin-suave">Hola, {s.nombre.split(" ")[0]}</p>
          <h1 className="font-display text-3xl font-semibold capitalize">{fechaLarga(ahora)}</h1>
        </div>
        <Link href="/panel/citas/nueva" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-carmin px-5 font-semibold text-white">
          <CalendarPlus aria-hidden className="size-5" /> Nueva cita
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi etiqueta="Citas hoy" valor={String(vivas.length)} />
        <Kpi etiqueta="Previsto" valor={formatCents(previsto)} />
        <Kpi etiqueta="Cobrado" valor={formatCents(cobrado.totalCents)} detalle={cobrado.propinasCents ? `+ ${formatCents(cobrado.propinasCents)} de propina` : undefined} />
        <Kpi etiqueta="Por cobrar" valor={String(porCobrar.length)} aviso={porCobrar.length > 0} />
      </dl>

      {porCobrar.length > 0 && (
        <section className="rounded-3xl border border-amber-300/60 bg-amber-50 p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <AlertTriangle aria-hidden className="size-5 text-amber-600" /> Ya pasaron y no están cobradas
          </h2>
          <ul className="mt-3 divide-y divide-amber-200">
            {porCobrar.map((c) => (
              <li key={c.id}>
                <Link href={`/panel/citas/${c.id}`} className="flex min-h-12 items-center justify-between gap-3 py-2">
                  <span>
                    <span className="font-semibold tabular-nums">{hora(c.inicio)}</span> · {c.clienta?.nombre ?? "Sin clienta"}
                  </span>
                  <span className="text-sm font-semibold text-carmin">Cobrar →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Rejilla columnas={columnasDia(agenda, hoy)} abre={agenda.abre} cierra={agenda.cierra} ahora={ahora.toISOString()} />

      <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Mañana sin confirmar</h2>
        <p className="mt-1 text-sm text-gris">
          Les llega el recordatorio por correo hacia las 10. Si alguna no contesta, una llamada evita un hueco vacío.
        </p>
        {sinConfirmar.length === 0 ? (
          <p className="mt-3 text-sm text-gris">{agendaManana.citas.length ? "Todas han confirmado." : "Mañana no hay citas."}</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--capa-borde)]">
            {sinConfirmar.map((c) => (
              <li key={c.id} className="flex min-h-12 flex-wrap items-center justify-between gap-2 py-2">
                <Link href={`/panel/citas/${c.id}`} className="min-w-0">
                  <span className="font-semibold tabular-nums">{hora(c.inicio)}</span> · {c.clienta?.nombre ?? "Sin clienta"}
                  <span className="block truncate text-xs text-gris">{c.servicios.join(" + ")}</span>
                </Link>
                {c.clienta?.telefono && (
                  <a href={`tel:${c.clienta.telefono}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-rosa-niebla px-4 text-sm font-semibold text-carmin">
                    <Phone aria-hidden className="size-4" /> {formatearTelefonoES(c.clienta.telefono)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({ etiqueta, valor, detalle, aviso }: { etiqueta: string; valor: string; detalle?: string; aviso?: boolean }) {
  return (
    <div className={`rounded-3xl border bg-white p-4 ${aviso ? "border-amber-300" : "border-[var(--capa-borde)]"}`}>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-gris">{etiqueta}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{valor}</dd>
      {detalle && <dd className="text-xs text-gris">{detalle}</dd>}
    </div>
  );
}
