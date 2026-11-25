import Link from "next/link";
import { TarjetaNegocio, type NegocioConDolor } from "@/components/TarjetaNegocio";
import { Progreso, Vacio } from "@/components/ui";
import { getSesion } from "@/lib/sesion";
import { esContactado, type Estado } from "@/lib/tipos";

/** Los negocios del día: primero los pendientes y los de «volver a llamar». */
const ORDEN: Record<Estado, number> = { pendiente: 0, volver: 1, sin_respuesta: 2, esperando: 2, interesado: 3, quiere_propuesta: 4, reunion: 5, no_interesa: 6, no_contactar: 7 };

/** A quién escribir por Instagram: infoproductores, coaches y negocios con citas por DM; primero los pendientes. */
export async function ParaEscribir() {
  const { db } = await getSesion();
  const { data } = await db.from("negocios").select("*, diagnosticos(dolor)").in("sector", ["infoproducto", "otro"]).order("nombre").range(0, 999);
  const todos = (data ?? []) as NegocioConDolor[];
  const contactados = todos.filter((n) => esContactado(n.estado)).length;
  const abiertos = todos.filter((n) => n.estado !== "no_interesa" && n.estado !== "no_contactar").sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado]);
  const visibles = abiertos.slice(0, 40);

  return (
    <>
      <h2 className="mb-1 text-xl font-bold">A quién escribir</h2>
      <p className="mb-4 text-muted">Por Instagram. En cada ficha tienes la secuencia de mensajes de Gus, paso a paso, lista para copiar.</p>

      <div className="mb-6 rounded-2xl border border-line bg-side p-4">
        <Progreso valor={contactados} total={todos.length || 1} etiqueta="Contactados" />
        <p className="mt-2 text-sm text-muted">Objetivo: 10 testers para la beta. Unos 15-20 mensajes al día cada uno.</p>
      </div>

      {visibles.length === 0 ? (
        <Vacio>
          Todavía no hay infoproductores. Se cargan desde <Link href="/importar" className="font-bold text-brand underline">Importar</Link> o en la tanda de cada noche.
        </Vacio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {visibles.map((n) => (
            <TarjetaNegocio key={n.id} n={n} />
          ))}
        </ul>
      )}
      {abiertos.length > visibles.length && (
        <p className="mt-4">
          <Link href="/negocios?sector=infoproducto" className="font-bold text-brand underline">
            Ver los {abiertos.length} infoproductores
          </Link>
        </p>
      )}
    </>
  );
}
