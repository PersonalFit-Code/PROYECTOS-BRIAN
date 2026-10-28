import type { Metadata } from "next";
import { Recurrentes } from "@/components/finanzas/Recurrentes";
import { Boton, Campo, Card, Etiqueta, Kpi, Seccion, Selector, Titulo } from "@/components/ui/basicos";
import { FormAccion } from "@/components/ui/FormAccion";
import { getCategorias, getRecurrentes } from "@/lib/datos/consultas";
import { hoy } from "@/lib/fechas";
import { mensual } from "@/lib/finanzas";
import { euros } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";
import { crearRecurrente } from "../acciones";

export const metadata: Metadata = { title: "Fijos y suscripciones" };

export default async function SuscripcionesPage() {
  const s = await getSesion();
  const [items, categorias] = await Promise.all([getRecurrentes(s), getCategorias(s)]);
  const activos = items.filter((i) => i.active);
  const subs = activos.filter((i) => i.is_subscription && i.kind === "gasto");
  const fijos = activos.filter((i) => !i.is_subscription && i.kind === "gasto");
  const ingresos = activos.filter((i) => i.kind === "ingreso");
  const total = (xs: typeof items) => xs.reduce((a, i) => a + mensual(i.amount, i.frequency), 0);

  return (
    <>
      <Titulo emoji="🔁" sub="Se apuntan solos en Movimientos el día que toca.">
        Fijos y suscripciones
      </Titulo>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi etiqueta="Suscripciones / mes" valor={euros(total(subs))} detalle={`${euros(total(subs) * 12, false)} al año`} />
        <Kpi etiqueta="Gastos fijos / mes" valor={euros(total(fijos))} />
        <Kpi etiqueta="Ingresos fijos / mes" valor={euros(total(ingresos))} tono="ok" />
        <Kpi etiqueta="Margen fijo / mes" valor={euros(total(ingresos) - total(subs) - total(fijos))} tono={total(ingresos) - total(subs) - total(fijos) >= 0 ? "ok" : "bad"} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <Seccion titulo={`Suscripciones (${subs.length})`}>
            <Recurrentes items={items.filter((i) => i.is_subscription)} categorias={categorias} />
          </Seccion>
          <Seccion titulo="Gastos e ingresos fijos">
            <Recurrentes items={items.filter((i) => !i.is_subscription)} categorias={categorias} />
          </Seccion>
        </div>
        <Seccion titulo="Añadir">
          <Card>
            <FormAccion accion={crearRecurrente} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Etiqueta label="Nombre">
                  <Campo name="name" required placeholder="Netflix, alquiler, gimnasio…" />
                </Etiqueta>
              </div>
              <Etiqueta label="Importe (€)">
                <Campo name="amount" inputMode="decimal" required placeholder="12,99" />
              </Etiqueta>
              <Etiqueta label="Tipo">
                <Selector name="kind" defaultValue="gasto">
                  <option value="gasto">Gasto</option>
                  <option value="ingreso">Ingreso</option>
                </Selector>
              </Etiqueta>
              <Etiqueta label="Cada">
                <Selector name="frequency" defaultValue="mensual">
                  <option value="semanal">Semana</option>
                  <option value="mensual">Mes</option>
                  <option value="anual">Año</option>
                </Selector>
              </Etiqueta>
              <Etiqueta label="Próximo cobro">
                <Campo name="next_date" type="date" required defaultValue={hoy()} />
              </Etiqueta>
              <div className="col-span-2">
                <Etiqueta label="Categoría">
                  <Selector name="category_id" defaultValue="">
                    <option value="">—</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name} ({c.kind})
                      </option>
                    ))}
                  </Selector>
                </Etiqueta>
              </div>
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_subscription" defaultChecked className="accent-[var(--accent)]" /> Es una suscripción
              </label>
              <div className="col-span-2">
                <Boton variante="primario">Añadir</Boton>
              </div>
            </FormAccion>
          </Card>
        </Seccion>
      </div>
    </>
  );
}
