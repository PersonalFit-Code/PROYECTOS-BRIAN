import { Info, Plus } from "lucide-react";
import { getAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";
import EditorFranjas from "../_comun/EditorFranjas";
import { DESPLEGABLE, RESUMEN_DESPLEGABLE, TARJETA } from "../_comun/estilos";
import { ordenarFranjas, type Franja } from "../_comun/franjas";
import { guardarHorario } from "./acciones";
import { DIAS_ISO } from "./dias";
import FormProfesional from "./FormProfesional";

export const dynamic = "force-dynamic";
export const metadata = { title: "Equipo" };

/** "09:30:00" (lo que devuelve Postgres para `time`) → "09:30". */
const hhmm = (t: string) => t.slice(0, 5);

/** Resumen de una línea del horario para la tarjeta: «Lun 09:30–13:30, 15:30–19:30 · Mar …». */
function resumenHorario(semana: Record<string, Franja[]>): string {
  const partes = DIAS_ISO.filter((d) => (semana[d.clave] ?? []).length > 0).map(
    (d) => `${d.nombre.slice(0, 3)} ${(semana[d.clave] ?? []).map((f) => `${f.inicio}–${f.fin}`).join(", ")}`,
  );
  return partes.length > 0 ? partes.join(" · ") : "Sin horario: no se le pueden reservar citas.";
}

export default async function EquipoPage() {
  const db = getAdminClient();
  const [equipo, horas] = await Promise.all([
    db.from("staff").select("*").order("position").order("name"),
    db.from("staff_hours").select("staff_id, weekday, start_time, end_time"),
  ]);
  if (equipo.error || horas.error) {
    return (
      <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-carmin ring-1 ring-carmin/20">
        No se pudo cargar el equipo. Recarga la página en un momento.
      </p>
    );
  }

  const horarios = new Map<string, Record<string, Franja[]>>();
  for (const h of horas.data ?? []) {
    const semana = horarios.get(h.staff_id) ?? {};
    const clave = String(h.weekday);
    semana[clave] = ordenarFranjas([...(semana[clave] ?? []), { inicio: hhmm(h.start_time), fin: hhmm(h.end_time) }]);
    horarios.set(h.staff_id, semana);
  }
  const lista = equipo.data ?? [];
  const posicionNueva = lista.reduce((max, p) => Math.max(max, p.position + 1), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Equipo</h1>
        <p className="mt-1 text-sm text-gris">Quién trabaja en el salón, cómo se ve en la web y en qué horario se le puede reservar.</p>
      </header>

      <p className="flex gap-3 rounded-2xl bg-rosa-niebla px-4 py-3 text-sm text-tinta">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-carmin" />
        <span>
          Aquí se crea a la profesional para la agenda y la web. El usuario y la contraseña para entrar al panel los crea Brian
          aparte; pídeselo cuando alguien nuevo necesite acceso.
        </span>
      </p>

      <details className={DESPLEGABLE}>
        <summary className={RESUMEN_DESPLEGABLE}>
          <span className="flex items-center gap-2">
            <Plus aria-hidden className="size-5" /> Nueva profesional
          </span>
        </summary>
        <div className="border-t border-[var(--capa-borde)] p-4">
          <FormProfesional posicionNueva={posicionNueva} />
        </div>
      </details>

      {lista.length === 0 && <p className="text-sm text-gris">Todavía no hay nadie en el equipo.</p>}

      <ul className="space-y-4">
        {lista.map((p) => {
          const semana = horarios.get(p.id) ?? {};
          return (
            <li key={p.id} className={cn(TARJETA, !p.active && "opacity-75")}>
              <div className="flex items-start gap-3">
                <span aria-hidden className="mt-1 size-4 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                <div className="min-w-0 flex-1">
                  <h2 className="flex flex-wrap items-center gap-2 font-display text-xl font-semibold">
                    {p.name}
                    {!p.active && <span className="rounded-full bg-rosa-niebla px-2 py-0.5 font-sans text-xs font-semibold text-carmin">Inactiva</span>}
                    {p.active && !p.bookable_online && (
                      <span className="rounded-full bg-rosa-niebla px-2 py-0.5 font-sans text-xs font-semibold text-carmin">No reservable online</span>
                    )}
                  </h2>
                  {p.specialties.length > 0 && <p className="mt-0.5 text-sm text-gris">{p.specialties.join(" · ")}</p>}
                  <p className="mt-1 text-sm text-gris">{resumenHorario(semana)}</p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <details className={DESPLEGABLE}>
                  <summary className={RESUMEN_DESPLEGABLE}>Editar datos</summary>
                  <div className="border-t border-[var(--capa-borde)] p-4">
                    <FormProfesional profesional={p} />
                  </div>
                </details>
                <details className={DESPLEGABLE}>
                  <summary className={RESUMEN_DESPLEGABLE}>Horario semanal</summary>
                  <div className="border-t border-[var(--capa-borde)] p-3 sm:p-4">
                    <p className="mb-3 text-sm text-gris">
                      Horas en las que se le pueden dar citas. Varias franjas por día si para a comer. Las vacaciones y días sueltos
                      se ponen en Configuración → Cierres.
                    </p>
                    <EditorFranjas
                      dias={DIAS_ISO}
                      inicial={semana}
                      accion={guardarHorario}
                      campos={{ staff_id: p.id }}
                      textoBoton={`Guardar horario de ${p.name}`}
                    />
                  </div>
                </details>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
