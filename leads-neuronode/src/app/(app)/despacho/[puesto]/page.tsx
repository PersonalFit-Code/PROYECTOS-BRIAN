import { ArrowLeft, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FichaAgente } from "@/components/FichaAgente";
import { ParaEscribir } from "@/components/ParaEscribir";
import { TarjetaNegocio, type NegocioConDolor } from "@/components/TarjetaNegocio";
import { Titulo, Vacio, claseBoton } from "@/components/ui";
import { PUESTO, esPuesto, type Puesto } from "@/lib/oficina";
import { INTERESADO, cargarOficina } from "@/lib/oficinaDatos";
import { getSesion } from "@/lib/sesion";

export async function generateMetadata({ params }: { params: Promise<{ puesto: string }> }): Promise<Metadata> {
  const { puesto } = await params;
  return { title: esPuesto(puesto) ? `Despacho de ${PUESTO[puesto].nombre}` : "Despacho" };
}

/** El despacho de un agente: qué hace, qué está haciendo, qué le puedes sacar y su trabajo, ahí mismo. */
export default async function Despacho({ params }: { params: Promise<{ puesto: string }> }) {
  const { puesto } = await params;
  if (!esPuesto(puesto)) notFound();
  const { db } = await getSesion();
  const { estado, hechos, apuntes } = await cargarOficina(db);
  const f = PUESTO[puesto];

  return (
    <>
      <Link href="/" className="mb-3 inline-flex min-h-11 items-center gap-2 font-bold text-muted hover:text-brand">
        <ArrowLeft className="size-4" aria-hidden />
        Oficina
      </Link>
      <Titulo sub={`Departamento de ${f.cargo.toLowerCase()}`}>Despacho de {f.nombre}</Titulo>

      <FichaAgente p={puesto} e={estado[puesto]} hechos={hechos[puesto]} apuntes={apuntes.filter((a) => a.puesto === puesto)} />

      <div className="mt-8 scroll-mt-4" id={puesto === "guion" ? "escribir" : "trabajo"}>
        {puesto === "guion" ? <ParaEscribir /> : <Trabajo puesto={puesto} />}
      </div>
    </>
  );
}

const TITULO: Record<Exclude<Puesto, "guion">, { titulo: string; sub: string; vacio: string }> = {
  captacion: { titulo: "Lo que ha encontrado", sub: "Los infoproductores y coaches que ha traído, lo más nuevo primero.", vacio: "Todavía no ha traído a nadie. Esta noche empieza a buscar." },
  diagnostico: { titulo: "Lo que ha mirado", sub: "Cada uno con el problema que ha visto. Entra en la ficha para ver la prueba.", vacio: "Todavía no ha mirado a nadie." },
  oferta: { titulo: "Los interesados", sub: "Los que han dicho que les interesa. Aquí escribe su propuesta.", vacio: "Cuando alguien te diga que le interesa, aparecerá aquí." },
  diseno: { titulo: "Los interesados", sub: "Los que han dicho que les interesa. Aquí monta su propuesta visual.", vacio: "Cuando alguien te diga que le interesa, aparecerá aquí." },
};

/** El trabajo del agente, en tarjetas que llevan a cada ficha. */
async function Trabajo({ puesto }: { puesto: Exclude<Puesto, "guion"> }) {
  const { db } = await getSesion();
  let consulta = db.from("negocios").select(puesto === "diagnostico" ? "*, diagnosticos!inner(dolor)" : "*, diagnosticos(dolor)");
  if (puesto === "oferta" || puesto === "diseno") consulta = consulta.in("estado", [...INTERESADO]);
  const { data } = await consulta.order("creado", { ascending: false }).range(0, 59);
  const lista = (data ?? []) as unknown as NegocioConDolor[];
  const t = TITULO[puesto];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t.titulo}</h2>
          <p className="text-muted">{t.sub}</p>
        </div>
        {puesto === "captacion" && (
          <div className="flex flex-wrap gap-2">
            <Link href="/importar" className={claseBoton("suave")}>
              <Upload className="size-4" aria-hidden />
              Cargar una lista
            </Link>
            <Link href="/negocios?sector=infoproducto" className={claseBoton("suave")}>
              Buscar y filtrar
            </Link>
          </div>
        )}
      </div>
      {lista.length === 0 ? (
        <Vacio>{t.vacio}</Vacio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {lista.map((n) => (
            <TarjetaNegocio key={n.id} n={n} />
          ))}
        </ul>
      )}
    </section>
  );
}
