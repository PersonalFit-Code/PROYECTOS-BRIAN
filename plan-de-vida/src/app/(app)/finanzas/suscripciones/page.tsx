import type { Metadata } from "next";
import { Recurrentes } from "@/components/finanzas/Recurrentes";
import { Banknote, House, Plus, Repeat, Scale } from "lucide-react";
import { Boton, Campo, Etiqueta, Kpi, Selector, Titulo } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { Hoja } from "@/components/ui/Hoja";
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

  const form = (
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
      <Etiqueta label="Categoría">
        <Selector name="category_id" defaultValue="">
          <option value="">—</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.kind})
            </option>
          ))}
        </Selector>
      </Etiqueta>
      <Etiqueta label="Se paga con">
        <Selector name="method" defaultValue="tarjeta">
          <option value="tarjeta">Tarjeta</option>
          <option value="efectivo">Efectivo</option>
        </Selector>
      </Etiqueta>
      <label className="col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_subscription" defaultChecked className="accent-[var(--accent)]" /> Es una suscripción
      </label>
      <div className="col-span-2">
        <Boton variante="primario" className="w-full">
          Añadir
        </Boton>
      </div>
    </FormAccion>
  );

  return (
    <>
      <Titulo
        icono={<Repeat />}
        color="purple"
        sub="Se apuntan solos en Movimientos el día que toca."
        acciones={
          <Hoja titulo="Añadir fijo o suscripción" boton="Añadir" icono={<Plus />}>
            {form}
          </Hoja>
        }
      >
        Fijos y suscripciones
      </Titulo>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi i={0} icono={<Repeat />} etiqueta="Suscripciones / mes" valor={euros(total(subs))} detalle={`${euros(total(subs) * 12, false)} al año`} />
        <Kpi i={1} icono={<House />} etiqueta="Gastos fijos / mes" valor={euros(total(fijos))} />
        <Kpi i={2} icono={<Banknote />} etiqueta="Ingresos fijos / mes" valor={euros(total(ingresos))} tono="ok" />
        <Kpi i={3} icono={<Scale />} etiqueta="Margen fijo / mes" valor={euros(total(ingresos) - total(subs) - total(fijos))} tono={total(ingresos) - total(subs) - total(fijos) >= 0 ? "ok" : "bad"} />
      </div>

      <Desplegable icono={<Repeat />} color="purple" titulo="Suscripciones" resumen={`${subs.length}`} abierto i={4}>
        <Recurrentes items={items.filter((i) => i.is_subscription)} categorias={categorias} />
      </Desplegable>
      <Desplegable icono={<House />} color="blue" titulo="Gastos e ingresos fijos" resumen={`${items.filter((i) => !i.is_subscription).length}`} i={5}>
        <Recurrentes items={items.filter((i) => !i.is_subscription)} categorias={categorias} />
      </Desplegable>
    </>
  );
}
