import type { Metadata } from "next";
import { Hucha } from "@/components/finanzas/Hucha";
import { CalendarClock, PiggyBank, Plus } from "lucide-react";
import { Boton, Campo, Etiqueta, Kpi, Titulo, Vacio } from "@/components/ui/basicos";
import { Hoja } from "@/components/ui/Hoja";
import { SelectorIcono } from "@/components/ui/SelectorIcono";
import { FormAccion } from "@/components/ui/FormAccion";
import { getHuchas } from "@/lib/datos/consultas";
import { hoy } from "@/lib/fechas";
import { ritmoMensual } from "@/lib/finanzas";
import { euros } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";
import { n } from "@/lib/tipos";
import { crearHucha } from "../acciones";

export const metadata: Metadata = { title: "Huchas" };

export default async function HuchasPage() {
  const huchas = await getHuchas(await getSesion());
  const dia = hoy();
  const total = huchas.reduce((a, h) => a + n(h.saved), 0);
  const ritmoTotal = huchas.filter((h) => !h.done).reduce((a, h) => a + (ritmoMensual(n(h.target), n(h.saved), h.target_date, dia) ?? 0), 0);

  return (
    <>
      <Titulo
        icono={<PiggyBank />}
        color="pink"
        sub="Metas de ahorro: fondo de emergencia, viajes, coche…"
        acciones={
          <Hoja titulo="Nueva hucha" boton="Nueva hucha" icono={<Plus />}>
            <FormAccion accion={crearHucha} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Etiqueta label="Nombre">
                  <Campo name="name" required placeholder="Fondo de emergencia" />
                </Etiqueta>
              </div>
              <div className="col-span-2">
                <Etiqueta label="Icono" grupo>
                  <SelectorIcono name="emoji" inicial="piggy-bank" />
                </Etiqueta>
              </div>
              <Etiqueta label="Objetivo (€)">
                <Campo name="target" inputMode="decimal" required placeholder="6000" />
              </Etiqueta>
              <Etiqueta label="Ya tengo (€)">
                <Campo name="saved" inputMode="decimal" placeholder="0" />
              </Etiqueta>
              <div className="col-span-2">
                <Etiqueta label="Para cuándo">
                  <Campo name="target_date" type="date" />
                </Etiqueta>
              </div>
              <div className="col-span-2">
                <Boton variante="primario" className="w-full">
                  Crear hucha
                </Boton>
              </div>
            </FormAccion>
          </Hoja>
        }
      >
        Huchas
      </Titulo>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Kpi i={0} icono={<PiggyBank />} etiqueta="Ahorrado en huchas" valor={euros(total, false)} />
        <Kpi i={1} icono={<CalendarClock />} etiqueta="A apartar al mes" valor={euros(ritmoTotal, false)} detalle="para llegar a tiempo" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {huchas.length ? (
          huchas.map((h) => <Hucha key={h.id} hucha={h} ritmo={h.done ? null : ritmoMensual(n(h.target), n(h.saved), h.target_date, dia)} />)
        ) : (
          <Vacio>Crea tu primera hucha. Consejo: empieza por un fondo de emergencia de 3–6 meses de gastos.</Vacio>
        )}
      </div>
    </>
  );
}
