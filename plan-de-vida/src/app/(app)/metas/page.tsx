import type { Metadata } from "next";
import { ListTodo, Plus, Target } from "lucide-react";
import { Pagina } from "@/components/layout/Pagina";
import { ListaTareas } from "@/components/metas/ListaTareas";
import { TarjetaMeta } from "@/components/metas/TarjetaMeta";
import { Vision } from "@/components/metas/Vision";
import { Boton, Campo, Card, Etiqueta, Progreso, Selector, Texto, Titulo } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { FormAccion } from "@/components/ui/FormAccion";
import { Hoja } from "@/components/ui/Hoja";
import { Icono, IconoCaja } from "@/components/ui/iconos";
import { Segmentado } from "@/components/ui/Segmentado";
import { getAreas, getMetas, getMovimientos, getRecurrentes, getTareas } from "@/lib/datos/consultas";
import { hoy as hoyMadrid, mesDe, rangoMes } from "@/lib/fechas";
import { aplicarAuto } from "@/lib/metas/auto";
import { getSesion } from "@/lib/sesion";
import { n, type Area } from "@/lib/tipos";
import { crearMeta } from "./acciones";

export const metadata: Metadata = { title: "Metas" };

function FormMeta({ areas, anio, areaId }: { areas: Area[]; anio: number; areaId?: string }) {
  return (
    <FormAccion accion={crearMeta} className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <Etiqueta label="Meta">
          <Campo name="title" required placeholder="Ahorrar 10.000 €, correr una media maratón…" />
        </Etiqueta>
      </div>
      <Etiqueta label="Área">
        <Selector name="area_id" defaultValue={areaId ?? areas[0]?.id}>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
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
      <Etiqueta label="Trimestre / mes">
        <div className="flex gap-2">
          <Campo name="quarter" type="number" min={1} max={4} placeholder="T" />
          <Campo name="month" type="number" min={1} max={12} placeholder="Mes" />
        </div>
      </Etiqueta>
      <Etiqueta label="Desde">
        <Campo name="start_value" inputMode="decimal" placeholder="0" />
      </Etiqueta>
      <Etiqueta label="Hasta (objetivo)">
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
        <Boton variante="primario" className="w-full">
          Crear meta
        </Boton>
      </div>
    </FormAccion>
  );
}

export default async function MetasPage({ searchParams }: { searchParams: Promise<{ anio?: string }> }) {
  const sp = await searchParams;
  const hoy = hoyMadrid();
  const anioActual = Number(hoy.slice(0, 4));
  const anio = Number(sp.anio) >= 2000 && Number(sp.anio) <= 2100 ? Number(sp.anio) : anioActual;
  const s = await getSesion();
  const mes = rangoMes(mesDe(hoy));
  const [areas, todas, tareas, movimientos, recurrentes] = await Promise.all([
    getAreas(s),
    getMetas(s, anio),
    getTareas(s, { pendientes: false }),
    getMovimientos(s, mes.desde, mes.hasta),
    getRecurrentes(s),
  ]);
  const { metas, estados } = aplicarAuto(todas, movimientos, recurrentes, mesDe(hoy));

  const cuentaTareas = (id: string) => {
    const ts = tareas.filter((t) => t.goal_id === id);
    return { hechas: ts.filter((t) => t.done).length, total: ts.length };
  };
  const visibles = metas.filter((m) => m.status !== "descartada");
  const media = (ms: typeof metas) => (ms.length ? ms.reduce((a, m) => a + n(m.progress_pct), 0) / ms.length : 0);
  const pendientes = tareas.filter((t) => !t.done);

  return (
    <Pagina>
      <Titulo
        icono={<Target />}
        color="purple"
        sub="Visión por área, metas medibles y las tareas que las mueven."
        acciones={
          <Hoja titulo="Nueva meta" boton="Nueva meta" icono={<Plus />}>
            <FormMeta areas={areas} anio={anio} />
          </Hoja>
        }
      >
        Metas {anio}
      </Titulo>

      <Segmentado
        className="mb-4"
        valor={String(anio)}
        opciones={[anioActual - 1, anioActual, anioActual + 1].map((a) => ({ valor: String(a), etiqueta: String(a), href: `/metas?anio=${a}` }))}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {areas.map((a, i) => {
          const delArea = visibles.filter((m) => m.area_id === a.id);
          return (
            <Card key={a.id} className="entrar p-3" style={{ ["--i" as string]: i }}>
              <div className="mb-2 flex items-center gap-2">
                <IconoCaja nombre={a.emoji} color={a.color} tamano="sm" />
                <span className="truncate text-sm font-medium">{a.name}</span>
              </div>
              <Progreso valor={media(delArea)} color={`var(--tag-${a.color}-fg)`} />
              <div className="mt-1 text-xs text-muted">
                {delArea.length} metas · {Math.round(media(delArea))} %
              </div>
            </Card>
          );
        })}
      </div>

      {areas.map((a, i) => {
        const delArea = metas.filter((m) => m.area_id === a.id);
        return (
          <Desplegable key={a.id} icono={<Icono nombre={a.emoji} />} color={a.color} titulo={a.name} resumen={`${delArea.length}`} abierto={i === 0 && delArea.length > 0} i={i + 1}>
            <Vision areaId={a.id} inicial={a.vision} />
            {delArea.length ? (
              <ul className="mt-2 grid gap-3 md:grid-cols-2">
                {delArea.map((m) => (
                  <TarjetaMeta key={m.id} meta={m} color={a.color} tareas={cuentaTareas(m.id)} auto={estados.get(m.id)} />
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-faint">Sin metas en {anio}.</p>
            )}
            <div className="mt-3">
              <Hoja titulo={`Nueva meta · ${a.name}`} boton="Añadir meta aquí" icono={<Plus />} variante="suave" claseBoton="py-1.5">
                <FormMeta areas={areas} anio={anio} areaId={a.id} />
              </Hoja>
            </div>
          </Desplegable>
        );
      })}

      {metas.some((m) => !m.area_id) && (
        <Desplegable icono={<Target />} titulo="Sin área" resumen={`${metas.filter((m) => !m.area_id).length}`}>
          <ul className="grid gap-3 md:grid-cols-2">
            {metas
              .filter((m) => !m.area_id)
              .map((m) => (
                <TarjetaMeta key={m.id} meta={m} color="gray" tareas={cuentaTareas(m.id)} auto={estados.get(m.id)} />
              ))}
          </ul>
        </Desplegable>
      )}

      <Desplegable icono={<ListTodo />} color="pink" titulo="Tareas pendientes" resumen={`${pendientes.length}`} i={6}>
        <ListaTareas tareas={pendientes} metas={visibles.filter((m) => m.status === "activa")} hoy={hoy} />
      </Desplegable>
    </Pagina>
  );
}
