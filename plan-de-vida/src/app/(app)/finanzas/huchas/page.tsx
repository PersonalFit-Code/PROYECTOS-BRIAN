import type { Metadata } from "next";
import { Hucha } from "@/components/finanzas/Hucha";
import { Boton, Campo, Card, Etiqueta, Kpi, Seccion, Titulo, Vacio } from "@/components/ui/basicos";
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
      <Titulo emoji="🐷" sub="Metas de ahorro: fondo de emergencia, viajes, coche…">
        Huchas
      </Titulo>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi etiqueta="Ahorrado en huchas" valor={euros(total, false)} />
        <Kpi etiqueta="A apartar al mes" valor={euros(ritmoTotal, false)} detalle="para llegar a tiempo" />
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {huchas.length ? huchas.map((h) => <Hucha key={h.id} hucha={h} ritmo={h.done ? null : ritmoMensual(n(h.target), n(h.saved), h.target_date, dia)} />) : <Vacio>Crea tu primera hucha. Consejo: empieza por un fondo de emergencia de 3–6 meses de gastos.</Vacio>}
      </div>
      <Seccion titulo="Nueva hucha">
        <Card>
          <FormAccion accion={crearHucha} className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <Etiqueta label="Emoji">
              <Campo name="emoji" defaultValue="🐷" maxLength={8} className="text-center" />
            </Etiqueta>
            <div className="sm:col-span-2">
              <Etiqueta label="Nombre">
                <Campo name="name" required placeholder="Fondo de emergencia" />
              </Etiqueta>
            </div>
            <Etiqueta label="Objetivo (€)">
              <Campo name="target" inputMode="decimal" required placeholder="6000" />
            </Etiqueta>
            <Etiqueta label="Ya tengo (€)">
              <Campo name="saved" inputMode="decimal" placeholder="0" />
            </Etiqueta>
            <Etiqueta label="Para cuándo">
              <Campo name="target_date" type="date" />
            </Etiqueta>
            <div className="col-span-full">
              <Boton variante="primario">Crear hucha</Boton>
            </div>
          </FormAccion>
        </Card>
      </Seccion>
    </>
  );
}
