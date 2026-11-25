import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Busto } from "@/components/Personaje";
import { Card, Progreso, claseBoton } from "@/components/ui";
import { cx, fechaHora } from "@/lib/formato";
import { PUESTO, type EstadoPuesto, type Puesto } from "@/lib/oficina";
import { n, type Apunte, type Hecho } from "@/lib/oficinaDatos";

/** El botón principal de cada agente: dónde ir a recoger su trabajo. */
const ENLACE: Record<Puesto, { href: string; txt: string }> = {
  captacion: { href: "#trabajo", txt: "Ver la lista" },
  diagnostico: { href: "#trabajo", txt: "Ver lo que ha mirado" },
  guion: { href: "#escribir", txt: "Ir a los mensajes de hoy" },
  oferta: { href: "/pipeline", txt: "Ver el pipeline" },
  diseno: { href: "/pipeline", txt: "Ver el pipeline" },
};

/** Lo que se ve al pinchar en un agente: qué hace, qué está haciendo ahora y qué te puede dar. */
export function FichaAgente({ p, e, hechos, apuntes }: { p: Puesto; e: EstadoPuesto; hechos: Hecho[]; apuntes: Apunte[] }) {
  const f = PUESTO[p];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <svg viewBox="62 30 76 86" className="size-14 shrink-0 rounded-full bg-soft" aria-hidden>
            <Busto f={f} />
          </svg>
          <div className="min-w-0">
            <h2 className="text-lg font-bold">
              {f.nombre} · {f.cargo}
            </h2>
            <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", e.activo ? "tono-marca" : "tono-gris")}>{e.activo ? "Trabajando" : "Esperando"}</span>
          </div>
        </div>
        <p className="mt-3 text-muted">{f.hace}</p>

        <Seccion titulo="Qué está haciendo ahora">
          <p className="mb-3 font-bold">«{e.frase}»</p>
          {e.total === null ? (
            <p className="text-sm">
              <span className="font-bold tabular-nums">{n(e.hechos)}</span> {e.cifra}
            </p>
          ) : (
            <Progreso valor={e.hechos} total={e.total} etiqueta={e.cifra.replace(/^./, (c) => c.toUpperCase())} />
          )}
        </Seccion>

        <Seccion titulo="Qué puedes sacar de él">
          <ul className="space-y-1">
            {f.sacar.map((s) => (
              <li key={s.txt}>
                <Link href={s.href} className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-2 hover:bg-soft">
                  <span>{s.txt}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Seccion>

        <Link href={ENLACE[p].href} className={claseBoton("primario", "mt-5")}>
          {ENLACE[p].txt}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold">Lo último que ha dejado hecho</h2>
          {hechos.length === 0 ? (
            <p className="text-muted">Todavía nada. {e.frase}.</p>
          ) : (
            <ol className="space-y-1">
              {hechos.map((h) => (
                <li key={`${h.id}-${h.cuando}`}>
                  <Link href={`/negocios/${h.id}`} className="block rounded-xl px-2 py-2 hover:bg-soft">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-bold">{h.titulo}</span>
                      <time dateTime={h.cuando} className="text-sm text-muted">
                        {fechaHora(h.cuando)}
                      </time>
                    </span>
                    {h.detalle && <span className="block text-sm text-muted">{h.detalle}</span>}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <Diario titulo={`Lo que ha apuntado ${f.nombre}`} apuntes={apuntes} />
      </div>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-5 border-t border-line pt-4">
      <h3 className="mb-2 text-sm font-bold tracking-wide text-brand uppercase">{titulo}</h3>
      {children}
    </section>
  );
}

export function Diario({ titulo, apuntes }: { titulo: string; apuntes: Apunte[] }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-lg font-bold">{titulo}</h2>
      {apuntes.length === 0 ? (
        <p className="text-muted">Todavía no hay nada apuntado.</p>
      ) : (
        <ol className="space-y-3">
          {apuntes.slice(0, 8).map((a) => (
            <li key={a.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
              <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-bold">{PUESTO[a.puesto].nombre}</span>
                <time dateTime={a.creado} className="text-sm text-muted">
                  {fechaHora(a.creado)}
                </time>
              </p>
              <p className="text-sm">{a.texto}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
