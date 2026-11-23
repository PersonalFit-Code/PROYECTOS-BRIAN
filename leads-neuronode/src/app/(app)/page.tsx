import type { Metadata } from "next";
import Link from "next/link";
import { TarjetaNegocio, type NegocioConDolor } from "@/components/TarjetaNegocio";
import { Progreso, Titulo, Vacio, claseBoton } from "@/components/ui";
import { cx } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";
import { DIAS_RETO, POR_DIA, esContactado, type Estado } from "@/lib/tipos";

export const metadata: Metadata = { title: "Hoy" };

/** Los negocios del día: primero los pendientes y los de «volver a llamar». */
const ORDEN: Record<Estado, number> = { pendiente: 0, volver: 1, sin_respuesta: 2, esperando: 2, interesado: 3, quiere_propuesta: 4, reunion: 5, no_interesa: 6, no_contactar: 7 };

export default async function Hoy({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { db } = await getSesion();
  const { dia: diaTxt } = await searchParams;

  const { data: resumen } = await db.from("negocios").select("dia, estado").not("dia", "is", null).range(0, 4999);
  const porDia = new Map<number, { total: number; hechos: number }>();
  for (const r of (resumen ?? []) as { dia: number; estado: Estado }[]) {
    const d = porDia.get(r.dia) ?? { total: 0, hechos: 0 };
    d.total++;
    if (esContactado(r.estado)) d.hechos++;
    porDia.set(r.dia, d);
  }

  // Sin día elegido: el primero que aún tenga negocios pendientes.
  const pedido = Number(diaTxt);
  const primeroPendiente = Array.from({ length: DIAS_RETO }, (_, i) => i + 1).find((d) => {
    const x = porDia.get(d);
    return x && x.hechos < x.total;
  });
  const dia = Number.isInteger(pedido) && pedido >= 1 && pedido <= DIAS_RETO ? pedido : (primeroPendiente ?? 1);

  const { data } = await db.from("negocios").select("*, diagnosticos(dolor)").eq("dia", dia).order("nombre").range(0, 499);
  const negocios = ((data ?? []) as NegocioConDolor[]).sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado]);
  const d = porDia.get(dia) ?? { total: 0, hechos: 0 };

  return (
    <>
      <Titulo sub="Los negocios que toca contactar, con lo que hemos visto de cada uno.">Día {dia}</Titulo>

      <nav aria-label="Días del reto" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: DIAS_RETO }, (_, i) => i + 1).map((n) => {
          const x = porDia.get(n);
          const completo = x && x.total > 0 && x.hechos === x.total;
          return (
            <Link
              key={n}
              href={`/?dia=${n}`}
              aria-current={n === dia ? "page" : undefined}
              className={cx(claseBoton(n === dia ? "primario" : "suave"), "shrink-0", completo && n !== dia && "text-ok")}
            >
              Día {n}
            </Link>
          );
        })}
      </nav>

      <div className="mb-6 rounded-2xl border border-line bg-side p-4">
        <Progreso valor={d.hechos} total={d.total || POR_DIA} etiqueta="Contactados hoy" />
      </div>

      {negocios.length === 0 ? (
        <Vacio>
          Este día todavía no tiene negocios. Se cargan desde <Link href="/importar" className="font-bold text-brand underline">Importar</Link>.
        </Vacio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {negocios.map((n) => (
            <TarjetaNegocio key={n.id} n={n} />
          ))}
        </ul>
      )}
    </>
  );
}
