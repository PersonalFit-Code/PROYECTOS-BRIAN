import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Diario } from "@/components/FichaAgente";
import { PausaMovimiento } from "@/components/PausaMovimiento";
import { OficinaIso } from "@/components/OficinaIso";
import { Card, Progreso, Titulo } from "@/components/ui";
import { cx } from "@/lib/formato";
import { PUESTO, PUESTOS, esPuesto } from "@/lib/oficina";
import { TESTERS, cargarOficina, n } from "@/lib/oficinaDatos";
import { getSesion } from "@/lib/sesion";

export const metadata: Metadata = { title: "Oficina" };

/** La portada: la oficina entera, con un despacho por departamento. Cada mesa abre el suyo. */
export default async function Oficina({ searchParams }: { searchParams: Promise<{ puesto?: string }> }) {
  const { puesto } = await searchParams;
  if (esPuesto(puesto)) redirect(`/despacho/${puesto}`);

  const { db } = await getSesion();
  const { estado, tramos, enEscena, apuntes, total, contactados, interesados } = await cargarOficina(db);

  return (
    <>
      <Titulo sub="Tus agentes, cada uno en su despacho. Pincha en una mesa para entrar y ver qué está haciendo y qué puedes sacar de él." acciones={<PausaMovimiento />}>
        Oficina
      </Titulo>

      <OficinaIso puestos={enEscena} tramos={tramos} elegido={null} />

      <ul aria-label="Despachos de la oficina" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {PUESTOS.map((p) => {
          const e = estado[p];
          return (
            <li key={p} className="last:col-span-2 sm:last:col-span-1">
              <Link href={`/despacho/${p}`} className="puesto flex h-full flex-col rounded-2xl border border-line bg-bg p-3">
                <span className="text-xs font-bold tracking-wide text-brand uppercase">{PUESTO[p].cargo}</span>
                <span className="font-[family-name:var(--font-titulo)] font-bold">{PUESTO[p].nombre}</span>
                <span className="mt-1 text-sm leading-snug">{e.frase}</span>
                <span className={cx("mt-2 inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-bold", e.activo ? "tono-marca" : "tono-gris")}>{e.activo ? "Trabajando" : "Esperando"}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold">Cómo vamos</h2>
          <div className="space-y-4">
            <Progreso valor={interesados} total={TESTERS} etiqueta="Interesados en la beta (objetivo: 10 testers)" />
            <Progreso valor={contactados} total={total || 1} etiqueta="Ya les has escrito" />
            {PUESTOS.map((p) => {
              const e = estado[p];
              return e.total === null ? (
                <p key={p} className="flex justify-between text-sm">
                  <span className="font-bold">
                    {PUESTO[p].nombre}: {e.cifra}
                  </span>
                  <span className="text-muted tabular-nums">{n(e.hechos)}</span>
                </p>
              ) : (
                <Progreso key={p} valor={e.hechos} total={e.total} etiqueta={`${PUESTO[p].nombre}: ${e.cifra}`} />
              );
            })}
          </div>
        </Card>
        <Diario titulo="Diario de la oficina" apuntes={apuntes} />
      </div>

      <p className="mt-4 text-sm text-muted">Los agentes trabajan en una tanda cada noche y aquí ves lo que dejaron hecho. Los mensajes los mandas tú.</p>
    </>
  );
}
