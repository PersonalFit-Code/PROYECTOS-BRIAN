import type { Metadata } from "next";
import Link from "next/link";
import { Pagina } from "@/components/layout/Pagina";
import { ListaTareas } from "@/components/metas/ListaTareas";
import { TarjetaMeta } from "@/components/metas/TarjetaMeta";
import { Vision } from "@/components/metas/Vision";
import { Boton, Campo, Card, Etiqueta, Progreso, Seccion, Selector, Tag, Texto, Titulo } from "@/components/ui/basicos";
import { FormAccion } from "@/components/ui/FormAccion";
import { getAreas, getMetas, getTareas } from "@/lib/datos/consultas";
import { hoy as hoyMadrid } from "@/lib/fechas";
import { cx } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";
import { n } from "@/lib/tipos";
import { crearMeta } from "./acciones";

export const metadata: Metadata = { title: "Metas" };

export default async function MetasPage({ searchParams }: { searchParams: Promise<{ anio?: string }> }) {
  const sp = await searchParams;
  const hoy = hoyMadrid();
  const anioActual = Number(hoy.slice(0, 4));
  const anio = Number(sp.anio) >= 2000 && Number(sp.anio) <= 2100 ? Number(sp.anio) : anioActual;
  const s = await getSesion();
  const [areas, metas, tareas] = await Promise.all([getAreas(s), getMetas(s, anio), getTareas(s, { pendientes: false })]);

  const cuentaTareas = (id: string) => {
    const ts = tareas.filter((t) => t.goal_id === id);
    return { hechas: ts.filter((t) => t.done).length, total: ts.length };
  };
  const activas = metas.filter((m) => m.status !== "descartada");
  const media = (ms: typeof metas) => (ms.length ? ms.reduce((a, m) => a + n(m.progress_pct), 0) / ms.length : 0);
  const pendientesSinFecha = tareas.filter((t) => !t.done);

  return (
    <Pagina ancha>
      <Titulo emoji="🎯" sub="Visión por área → metas del año → trimestre → tareas. Lo que no se mide no mejora.">
        Metas {anio}
      </Titulo>

      <div className="mb-6 flex gap-1 text-sm">
        {[anioActual - 1, anioActual, anioActual + 1].map((a) => (
          <Link key={a} href={`/metas?anio=${a}`} className={cx("rounded-md px-3 py-1", a === anio ? "bg-hover font-medium" : "text-muted hover:bg-hover")}>
            {a}
          </Link>
        ))}
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {areas.map((a) => {
          const delArea = activas.filter((m) => m.area_id === a.id);
          return (
            <Card key={a.id} className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <Tag color={a.color}>
                  {a.emoji} {a.name}
                </Tag>
                <span className="text-xs tabular-nums text-muted">{delArea.length} metas</span>
              </div>
              <Progreso valor={media(delArea)} color={`var(--tag-${a.color}-fg)`} />
              <div className="mt-1 text-xs text-muted">{Math.round(media(delArea))} % de avance medio</div>
            </Card>
          );
        })}
      </div>

      {areas.map((a) => {
        const delArea = metas.filter((m) => m.area_id === a.id);
        return (
          <Seccion
            key={a.id}
            titulo={
              <span className="text-base text-fg">
                {a.emoji} {a.name}
              </span>
            }
          >
            <Vision areaId={a.id} inicial={a.vision} />
            {delArea.length ? (
              <ul className="mt-2 grid gap-3 md:grid-cols-2">
                {delArea.map((m) => (
                  <TarjetaMeta key={m.id} meta={m} color={a.color} tareas={cuentaTareas(m.id)} />
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-faint">Sin metas en {anio}.</p>
            )}
          </Seccion>
        );
      })}

      {metas.some((m) => !m.area_id) && (
        <Seccion titulo="Sin área">
          <ul className="grid gap-3 md:grid-cols-2">
            {metas
              .filter((m) => !m.area_id)
              .map((m) => (
                <TarjetaMeta key={m.id} meta={m} color="gray" tareas={cuentaTareas(m.id)} />
              ))}
          </ul>
        </Seccion>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <Seccion titulo="Nueva meta">
          <Card>
            <FormAccion accion={crearMeta} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Etiqueta label="Meta">
                  <Campo name="title" required placeholder="Ahorrar 10.000 €, correr una media maratón…" />
                </Etiqueta>
              </div>
              <Etiqueta label="Área">
                <Selector name="area_id" defaultValue={areas[0]?.id}>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.emoji} {a.name}
                    </option>
                  ))}
                </Selector>
              </Etiqueta>
              <Etiqueta label="Periodo">
                <Selector name="period" defaultValue="anual">
                  <option value="anual">Anual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="mensual">Mensual</option>
                </Selector>
              </Etiqueta>
              <Etiqueta label="Año">
                <Campo name="year" type="number" defaultValue={anio} />
              </Etiqueta>
              <Etiqueta label="Trimestre / mes (si aplica)">
                <div className="flex gap-2">
                  <Campo name="quarter" type="number" min={1} max={4} placeholder="T" />
                  <Campo name="month" type="number" min={1} max={12} placeholder="Mes" />
                </div>
              </Etiqueta>
              <Etiqueta label="Valor inicial">
                <Campo name="start_value" inputMode="decimal" placeholder="0" />
              </Etiqueta>
              <Etiqueta label="Objetivo">
                <Campo name="target_value" inputMode="decimal" placeholder="10000" />
              </Etiqueta>
              <Etiqueta label="Unidad">
                <Campo name="unit" placeholder="€, kg, libros…" />
              </Etiqueta>
              <Etiqueta label="Fecha límite">
                <Campo name="due_date" type="date" />
              </Etiqueta>
              <div className="col-span-2">
                <Etiqueta label="Por qué es importante (opcional)">
                  <Texto name="description" rows={2} />
                </Etiqueta>
              </div>
              <p className="col-span-2 text-xs text-muted">Sin objetivo numérico, el avance se pone a mano en %.</p>
              <div className="col-span-2">
                <Boton variante="primario">Crear meta</Boton>
              </div>
            </FormAccion>
          </Card>
        </Seccion>
        <Seccion titulo="Todas las tareas pendientes">
          <ListaTareas tareas={pendientesSinFecha} metas={activas.filter((m) => m.status === "activa")} hoy={hoy} />
        </Seccion>
      </div>
    </Pagina>
  );
}
