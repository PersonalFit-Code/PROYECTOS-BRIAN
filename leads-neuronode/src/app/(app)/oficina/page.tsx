import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PausaMovimiento } from "@/components/PausaMovimiento";
import { Personaje } from "@/components/Personaje";
import { Card, Progreso, Titulo, claseBoton } from "@/components/ui";
import { cx, fechaHora } from "@/lib/formato";
import { PUESTO, PUESTOS, esPuesto, type EstadoPuesto, type Puesto } from "@/lib/oficina";
import { getSesion } from "@/lib/sesion";
import { OBJETIVO, esContactado, type Estado } from "@/lib/tipos";

export const metadata: Metadata = { title: "Oficina" };

const n = (v: number) => v.toLocaleString("es-ES");

/** Dónde seguir el trabajo de cada puesto. */
const ENLACE: Record<Puesto, { href: string; txt: string }> = {
  captacion: { href: "/importar", txt: "Cargar más negocios" },
  diagnostico: { href: "/", txt: "Ver los negocios de hoy" },
  guion: { href: "/", txt: "Abrir los guiones de hoy" },
  oferta: { href: "/negocios?estado=quiere_propuesta", txt: "Ver quién quiere propuesta" },
  diseno: { href: "/negocios?estado=quiere_propuesta", txt: "Ver quién quiere propuesta" },
};

export default async function Oficina({ searchParams }: { searchParams: Promise<{ puesto?: string }> }) {
  const { db } = await getSesion();
  const { puesto: pedido } = await searchParams;
  const elegido = esPuesto(pedido) ? pedido : null;

  const [{ data: negocios }, { data: diag }, { data: props }, { data: diario }] = await Promise.all([
    db.from("negocios").select("id, estado").range(0, 4999),
    db.from("diagnosticos").select("negocio_id").range(0, 9999),
    db.from("propuestas").select("negocio_id, guion, correo_cuerpo, url_visual").range(0, 4999),
    db.from("actividad").select("id, puesto, texto, creado").order("creado", { ascending: false }).limit(40),
  ]);

  const lista = (negocios ?? []) as { id: string; estado: Estado }[];
  const total = lista.length;
  const contactados = lista.filter((x) => esContactado(x.estado)).length;
  const conDiagnostico = new Set(((diag ?? []) as { negocio_id: string }[]).map((d) => d.negocio_id)).size;
  const propuestas = (props ?? []) as { negocio_id: string; guion: unknown; correo_cuerpo: string | null; url_visual: string | null }[];
  const aMedida = propuestas.filter((p) => p.guion).length;
  const quieren = new Set(lista.filter((x) => x.estado === "quiere_propuesta" || x.estado === "interesado" || x.estado === "reunion").map((x) => x.id));
  const conOferta = propuestas.filter((p) => quieren.has(p.negocio_id) && p.correo_cuerpo).length;
  const conDiseno = propuestas.filter((p) => quieren.has(p.negocio_id) && p.url_visual).length;

  const estado: Record<Puesto, EstadoPuesto> = {
    captacion: {
      activo: total < OBJETIVO,
      frase: total < OBJETIVO ? `Me faltan ${n(OBJETIVO - total)} negocios` : "Ya están los 1.000",
      hechos: total,
      total: OBJETIVO,
      cifra: "negocios encontrados",
    },
    diagnostico: {
      activo: conDiagnostico < total,
      frase: total === 0 ? "Espero a que Leo traiga negocios" : conDiagnostico < total ? `Me quedan ${n(total - conDiagnostico)} por mirar` : "Todos mirados",
      hechos: conDiagnostico,
      total,
      cifra: "negocios con diagnóstico",
    },
    guion: {
      activo: aMedida < total,
      frase: total === 0 ? "Espero a que Leo traiga negocios" : aMedida < total ? "Todos tienen guion. Afino los que faltan" : "Todos a medida",
      hechos: aMedida,
      total,
      cifra: "guiones afinados a medida",
    },
    oferta: {
      activo: conOferta < quieren.size,
      frase: quieren.size === 0 ? "Espero al primer interesado" : conOferta < quieren.size ? `${n(quieren.size - conOferta)} propuestas por escribir` : "Al día",
      hechos: conOferta,
      total: quieren.size,
      cifra: "propuestas escritas",
    },
    diseno: {
      activo: conDiseno < quieren.size,
      frase: quieren.size === 0 ? "Espero al primer interesado" : conDiseno < quieren.size ? `${n(quieren.size - conDiseno)} propuestas por montar` : "Al día",
      hechos: conDiseno,
      total: quieren.size,
      cifra: "propuestas visuales",
    },
  };

  const apuntes = ((diario ?? []) as { id: string; puesto: Puesto; texto: string; creado: string }[]).filter((a) => !elegido || a.puesto === elegido);

  return (
    <>
      <Titulo sub="Cinco puestos, cada uno con su parte del trabajo. Toca uno para ver qué lleva." acciones={<PausaMovimiento />}>
        Oficina
      </Titulo>

      <section aria-label="Puestos de la oficina" className="oficina overflow-hidden rounded-3xl border border-line p-3 sm:p-5">
        <div className="mb-4 flex h-14 items-center justify-between gap-3 px-1" aria-hidden>
          <span className="font-[family-name:var(--font-titulo)] text-lg font-extrabold tracking-tight">
            neuro<span className="text-brand">·</span>node
          </span>
          <span className="oficina-ventana hidden h-10 w-40 rounded-lg border-4 border-white sm:block" />
          <span className="oficina-ventana h-10 w-24 rounded-lg border-4 border-white sm:w-40" />
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PUESTOS.map((p) => {
            const f = PUESTO[p];
            const e = estado[p];
            const sel = elegido === p;
            return (
              <li key={p} className="last:col-span-2 sm:last:col-span-1">
                <Link
                  href={sel ? "/oficina" : `/oficina?puesto=${p}#detalle`}
                  scroll={false}
                  aria-current={sel ? "true" : undefined}
                  data-activo={e.activo ? "si" : "no"}
                  className={cx("puesto flex h-full flex-col rounded-2xl border bg-bg/90 p-3", sel ? "border-brand ring-2 ring-brand" : "border-line")}
                >
                  <span className="bocadillo relative mb-2 block rounded-xl border border-line bg-bg px-2.5 py-1.5 text-sm leading-snug font-bold">{e.frase}</span>
                  <Personaje f={f} activo={e.activo} />
                  <span className="mt-1 block font-[family-name:var(--font-titulo)] font-bold">{f.nombre}</span>
                  <span className="block text-sm text-muted">{f.cargo}</span>
                  <span className={cx("mt-2 inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-bold", e.activo ? "tono-marca" : "tono-gris")}>{e.activo ? "Con trabajo" : "Esperando"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div id="detalle" className="mt-5 grid scroll-mt-4 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          {elegido ? (
            <>
              <h2 className="text-lg font-bold">
                {PUESTO[elegido].nombre} · {PUESTO[elegido].cargo}
              </h2>
              <p className="mt-1 mb-4 text-muted">{PUESTO[elegido].hace}</p>
              <Progreso valor={estado[elegido].hechos} total={estado[elegido].total} etiqueta={estado[elegido].cifra.replace(/^./, (c) => c.toUpperCase())} />
              <Link href={ENLACE[elegido].href} className={claseBoton("primario", "mt-4")}>
                {ENLACE[elegido].txt}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </>
          ) : (
            <>
              <h2 className="mb-3 text-lg font-bold">Cómo va el reto</h2>
              <div className="space-y-4">
                <Progreso valor={contactados} total={OBJETIVO} etiqueta="Negocios contactados" />
                {PUESTOS.map((p) => (
                  <Progreso key={p} valor={estado[p].hechos} total={estado[p].total} etiqueta={`${PUESTO[p].nombre}: ${estado[p].cifra}`} />
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold">{elegido ? `Lo último de ${PUESTO[elegido].nombre}` : "Diario de la oficina"}</h2>
          {apuntes.length === 0 ? (
            <p className="text-muted">Todavía no hay nada apuntado.</p>
          ) : (
            <ol className="space-y-3">
              {apuntes.slice(0, 12).map((a) => (
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
      </div>

      <p className="mt-4 text-sm text-muted">
        Los puestos no trabajan solos dentro de esta web: el trabajo se lanza en las sesiones con Claude y aquí se ve el resultado guardado.
      </p>
    </>
  );
}
