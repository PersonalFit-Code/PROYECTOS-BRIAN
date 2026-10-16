import { Trash2 } from "lucide-react";
import { desplazarFechaLocal, enZona, fechaLocal } from "@/lib/booking";
import { getAjustes } from "@/lib/reservas/ajustes";
import { getAdminClient } from "@/lib/supabase/admin";
import EditorFranjas from "../_comun/EditorFranjas";
import { TARJETA } from "../_comun/estilos";
import type { Franja } from "../_comun/franjas";
import { BotonAccion } from "../_comun/ui";
import { eliminarCierre, guardarHorarioSalon } from "./acciones";
import FormAjustes from "./FormAjustes";
import FormCierre from "./FormCierre";
import { DIAS_SALON, ZONA } from "./zona";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configuración" };

/** "2026-11-02" → "lun, 2 nov 2026". Se formatea en UTC porque es una fecha civil, sin hora. */
function fechaCorta(fecha: string): string {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(
    new Date(Date.UTC(a ?? 1970, (m ?? 1) - 1, d ?? 1)),
  );
}

const horaLocal = new Intl.DateTimeFormat("es-ES", { timeZone: ZONA, hour: "2-digit", minute: "2-digit" });

/**
 * Cómo se lee un cierre. Si empieza y acaba a medianoche es de días completos (así lo guarda
 * `crearCierre`) y se enseña «del 3 al 5 nov», con el último día INCLUIDO aunque en la base de
 * datos acabe a las 00:00 del día siguiente.
 */
function describirCierre(inicioIso: string, finIso: string): string {
  const inicio = new Date(inicioIso);
  const fin = new Date(finIso);
  const a = enZona(inicio, ZONA);
  const b = enZona(fin, ZONA);
  if (a.hora === 0 && a.minuto === 0 && b.hora === 0 && b.minuto === 0) {
    const primero = fechaLocal(inicio, ZONA);
    const ultimo = desplazarFechaLocal(fechaLocal(fin, ZONA), -1);
    return primero === ultimo ? `${fechaCorta(primero)} (todo el día)` : `Del ${fechaCorta(primero)} al ${fechaCorta(ultimo)}`;
  }
  const mismoDia = fechaLocal(inicio, ZONA) === fechaLocal(fin, ZONA);
  return mismoDia
    ? `${fechaCorta(fechaLocal(inicio, ZONA))}, de ${horaLocal.format(inicio)} a ${horaLocal.format(fin)}`
    : `Del ${fechaCorta(fechaLocal(inicio, ZONA))} ${horaLocal.format(inicio)} al ${fechaCorta(fechaLocal(fin, ZONA))} ${horaLocal.format(fin)}`;
}

export default async function ConfiguracionPage() {
  const db = getAdminClient();
  const ahora = new Date();
  const [ajustes, cierres, equipo] = await Promise.all([
    getAjustes(),
    db.from("time_off").select("id, staff_id, starts_at, ends_at, reason").gt("ends_at", ahora.toISOString()).order("starts_at").limit(100),
    db.from("staff").select("id, name, active").order("position").order("name"),
  ]);
  if (cierres.error || equipo.error) {
    return (
      <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-carmin ring-1 ring-carmin/20">
        No se pudo cargar la configuración. Recarga la página en un momento.
      </p>
    );
  }

  const nombres = new Map((equipo.data ?? []).map((p) => [p.id, p.name]));
  const horarioSalon: Record<string, Franja[]> = Object.fromEntries(
    DIAS_SALON.map((d) => [
      d.clave,
      (ajustes.salonHours[d.clave] ?? []).map((f) => ({ inicio: f.open, fin: f.close })),
    ]),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Configuración</h1>
        <p className="mt-1 text-sm text-gris">Reglas de la reserva online, días de cierre y el horario que se ve en la web.</p>
      </header>

      <nav aria-label="Apartados" className="flex flex-wrap gap-2">
        {[
          ["#cierres", "Cierres y ausencias"],
          ["#reserva", "Reserva online"],
          ["#horario", "Horario del salón"],
        ].map(([href, texto]) => (
          <a
            key={href}
            href={href}
            className="inline-flex min-h-11 items-center rounded-full border border-carmin/20 bg-white px-4 text-sm font-semibold text-carmin hover:bg-rosa-niebla"
          >
            {texto}
          </a>
        ))}
      </nav>

      <section id="cierres" className={`${TARJETA} scroll-mt-20`} aria-labelledby="t-cierres">
        <h2 id="t-cierres" className="font-display text-xl font-semibold">
          Cierres y ausencias
        </h2>
        <p className="mt-1 text-sm text-gris">
          Mientras dure, no se ofrecen horas online (al salón entero o a esa profesional). Las citas que ya existan no se anulan
          solas.
        </p>

        {(cierres.data ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-gris">No hay cierres próximos.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {(cierres.data ?? []).map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-[var(--capa-borde)] bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-tinta">{describirCierre(c.starts_at, c.ends_at)}</p>
                  <p className="text-sm text-gris">
                    {c.staff_id ? `Solo ${nombres.get(c.staff_id) ?? "una profesional"}` : "Todo el salón"}
                    {c.reason ? ` · ${c.reason}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end">
                  <BotonAccion
                    accion={eliminarCierre}
                    campos={{ id: c.id }}
                    etiqueta={`Quitar cierre: ${describirCierre(c.starts_at, c.ends_at)}`}
                    confirmar="¿Quitar este cierre? Se volverán a ofrecer esas horas online."
                    className="size-11 px-0"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </BotonAccion>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 border-t border-[var(--capa-borde)] pt-5">
          <h3 className="mb-3 font-semibold text-tinta">Añadir un cierre</h3>
          <FormCierre equipo={(equipo.data ?? []).filter((p) => p.active)} hoy={fechaLocal(ahora, ZONA)} />
        </div>
      </section>

      <section id="reserva" className={`${TARJETA} scroll-mt-20`} aria-labelledby="t-reserva">
        <h2 id="t-reserva" className="font-display text-xl font-semibold">
          Reserva online
        </h2>
        <p className="mb-4 mt-1 text-sm text-gris">Se aplican al momento a las reservas nuevas.</p>
        <FormAjustes
          valores={{
            horizon_days: ajustes.horizonDays,
            min_lead_minutes: ajustes.minLeadMinutes,
            slot_step_min: ajustes.slotStepMin,
            hold_minutes: ajustes.holdMinutes,
            cancel_hours: ajustes.cancelHours,
            reminder_hour_local: ajustes.reminderHourLocal,
            voucher_expiry_warning_days: ajustes.voucherExpiryWarningDays,
          }}
        />
      </section>

      <section id="horario" className={`${TARJETA} scroll-mt-20`} aria-labelledby="t-horario">
        <h2 id="t-horario" className="font-display text-xl font-semibold">
          Horario del salón
        </h2>
        <p className="mb-4 mt-1 text-sm text-gris">
          El que se ve en la web y decide si sale «abierto ahora». No cambia las horas que se pueden reservar: esas salen del horario
          de cada profesional (Equipo).
        </p>
        <EditorFranjas
          dias={DIAS_SALON.map((d) => ({ clave: d.clave, nombre: d.nombre }))}
          inicial={horarioSalon}
          accion={guardarHorarioSalon}
          textoBoton="Guardar horario del salón"
        />
      </section>
    </div>
  );
}
