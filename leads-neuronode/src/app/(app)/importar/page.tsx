import type { Metadata } from "next";
import { Boton, Card, Titulo } from "@/components/ui";
import { COLUMNAS } from "@/lib/csv";
import { getSesion } from "@/lib/sesion";
import { POR_DIA } from "@/lib/tipos";
import { FormImportar } from "./FormImportar";
import { repartirEnDias } from "./acciones";

export const metadata: Metadata = { title: "Importar" };

export default async function Importar() {
  const { db } = await getSesion();
  const { count } = await db.from("negocios").select("id", { count: "exact", head: true }).is("dia", null);
  const sinDia = count ?? 0;

  return (
    <>
      <Titulo sub="Carga los negocios encontrados y repártelos en los días del reto.">Importar</Titulo>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold">1. Cargar un fichero</h2>
          <FormImportar />
          <p className="mt-4 text-sm text-muted">
            Columnas que tiene que traer: <span className="break-words">{COLUMNAS.join(", ")}</span>. Los negocios repetidos se saltan solos.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold">2. Repartir en días</h2>
          <p className="mb-4">
            {sinDia > 0 ? (
              <>
                Hay <strong>{sinDia}</strong> negocios sin día. Se reparten de {POR_DIA} en {POR_DIA}, con el fitness primero y mezclando comunidades.
              </>
            ) : (
              "Todos los negocios tienen día asignado."
            )}
          </p>
          <form action={repartirEnDias}>
            <Boton variante="primario" disabled={sinDia === 0}>
              Repartir en días
            </Boton>
          </form>
        </Card>
      </div>
    </>
  );
}
