import { Rocket } from "lucide-react";
import { PreguntarCoach } from "@/components/coach/PreguntarCoach";
import { Progreso } from "@/components/ui/basicos";
import { euros } from "@/lib/formato";
import type { EstadoAuto } from "@/lib/metas/auto";
import type { Goal } from "@/lib/tipos";
import { n } from "@/lib/tipos";

/** Ticket medio de un cliente de mantenimiento y precio de una tarjeta NFC, para traducir lo que falta a acciones. */
const CLIENTE = 100;
const TARJETA = 20;

/** Tarjeta «Hacia 3.000 €/mes»: lo que entra este mes frente a la meta de ingresos, el ritmo y qué hace falta. */
export function HaciaMeta({ meta, estado }: { meta: Goal; estado: EstadoAuto }) {
  const objetivo = n(meta.target_value);
  const vaBien = estado.ritmo == null || estado.valor >= estado.ritmo;
  const hastaRitmo = estado.ritmo != null ? Math.max(0, estado.ritmo - estado.valor) : 0;
  return (
    <section className="glass entrar mb-5 rounded-2xl p-4" style={{ ["--i" as string]: 4 }}>
      <div className="mb-3 flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent [&_svg]:size-5">
          <Rocket />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-medium">Hacia {euros(objetivo, false)}/mes</div>
          <div className="text-xs text-muted">{meta.title}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold tabular-nums">{euros(estado.valor, false)}</div>
          <div className="text-[11px] text-muted">este mes</div>
        </div>
      </div>
      <Progreso valor={(100 * estado.valor) / objetivo} color={vaBien ? "var(--ok)" : "var(--warn)"} />
      <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted">
        <span>
          Fijos {euros(estado.fijos, false)} · apuntado {euros(estado.apuntado, false)}
        </span>
        {estado.ritmo != null && (
          <span style={{ color: vaBien ? "var(--ok)" : "var(--bad)" }}>
            Ritmo del mes: {euros(estado.ritmo, false)}
          </span>
        )}
      </div>
      {estado.falta > 0 && (
        <p className="mt-3 rounded-xl bg-bg/50 px-3 py-2 text-sm">
          {hastaRitmo > 0 ? (
            <>
              Para ir al ritmo te faltan <b className="tabular-nums">{euros(hastaRitmo, false)}</b> este mes: {Math.ceil(hastaRitmo / CLIENTE)} clientes de{" "}
              {CLIENTE} €/mes o {Math.ceil(hastaRitmo / TARJETA)} tarjetas NFC.
            </>
          ) : (
            <>
              Vas al ritmo. Hasta {euros(objetivo, false)} faltan <b className="tabular-nums">{euros(estado.falta, false)}</b>: {Math.ceil(estado.falta / CLIENTE)} clientes de{" "}
              {CLIENTE} €/mes más.
            </>
          )}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <PreguntarCoach pregunta={`Dame ideas concretas para llegar a ${euros(objetivo, false)} al mes con lo que ya hago`}>Ideas para llegar</PreguntarCoach>
        <PreguntarCoach pregunta="¿Cómo puedo cobrar más o mejorar lo que ya vendo?">Mejorar lo que vendo</PreguntarCoach>
      </div>
    </section>
  );
}
