import { ArrowRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PausaMovimiento } from "@/components/PausaMovimiento";
import { Busto } from "@/components/Personaje";
import { OficinaIso, type DatosPuesto, type Lugar, type Tramo } from "@/components/OficinaIso";
import { Card, Progreso, Titulo, claseBoton } from "@/components/ui";
import { cx, fechaHora } from "@/lib/formato";
import { PUESTO, PUESTOS, esPuesto, type EstadoPuesto, type Puesto } from "@/lib/oficina";
import { getSesion } from "@/lib/sesion";
import { esContactado, type Estado } from "@/lib/tipos";

export const metadata: Metadata = { title: "Oficina" };

/** Lo que buscamos ahora: 10 infoproductores o coaches que prueben el agente. */
const TESTERS = 10;

const n = (v: number) => v.toLocaleString("es-ES");

/** El botón principal de cada agente: dónde ir a recoger su trabajo. */
const ENLACE: Record<Puesto, { href: string; txt: string }> = {
  captacion: { href: "/negocios?sector=infoproducto", txt: "Ver la lista" },
  diagnostico: { href: "/hoy", txt: "Ver a quién escribir hoy" },
  guion: { href: "/hoy", txt: "Abrir los mensajes de hoy" },
  oferta: { href: "/pipeline", txt: "Ver el pipeline" },
  diseno: { href: "/pipeline", txt: "Ver el pipeline" },
};

const INTERESADO = new Set<Estado>(["interesado", "quiere_propuesta", "reunion"]);

interface Negocio {
  id: string;
  nombre: string;
  estado: Estado;
  creado: string;
}
interface Hecho {
  id: string;
  titulo: string;
  detalle?: string;
  cuando: string;
}

/** La hora del momento de pedir la página (en el servidor, fuera del render puro). */
async function ahora() {
  return Date.now();
}

export default async function Oficina({ searchParams }: { searchParams: Promise<{ puesto?: string }> }) {
  const { db } = await getSesion();
  const { puesto: pedido } = await searchParams;
  const elegido = esPuesto(pedido) ? pedido : null;

  const [{ data: negocios }, { data: diag }, { data: props }, { data: diario }] = await Promise.all([
    db.from("negocios").select("id, nombre, estado, creado").order("creado", { ascending: false }).range(0, 4999),
    db.from("diagnosticos").select("id, negocio_id, dolor, creado").order("creado", { ascending: false }).range(0, 9999),
    db.from("propuestas").select("negocio_id, guion, correo_cuerpo, url_visual, actualizado").order("actualizado", { ascending: false }).range(0, 4999),
    db.from("actividad").select("id, puesto, texto, creado").order("creado", { ascending: false }).limit(60),
  ]);

  const lista = (negocios ?? []) as Negocio[];
  const nombre = new Map(lista.map((x) => [x.id, x.nombre]));
  const total = lista.length;
  const contactados = lista.filter((x) => esContactado(x.estado)).length;
  const diagnosticos = ((diag ?? []) as { id: string; negocio_id: string; dolor: string; creado: string }[]).filter((d) => nombre.has(d.negocio_id));
  const conDiagnostico = new Set(diagnosticos.map((d) => d.negocio_id)).size;
  const propuestas = ((props ?? []) as { negocio_id: string; guion: unknown; correo_cuerpo: string | null; url_visual: string | null; actualizado: string }[]).filter((p) =>
    nombre.has(p.negocio_id),
  );
  const conGuion = propuestas.filter((p) => p.guion);
  const quieren = new Set(lista.filter((x) => INTERESADO.has(x.estado)).map((x) => x.id));
  const conOferta = propuestas.filter((p) => quieren.has(p.negocio_id) && p.correo_cuerpo);
  const conDiseno = propuestas.filter((p) => quieren.has(p.negocio_id) && p.url_visual);
  const porEscribir = lista.filter((x) => x.estado === "pendiente").length;
  const haceUnaSemana = new Date(await ahora() - 7 * 864e5).toISOString();
  const semana = lista.filter((x) => x.creado >= haceUnaSemana).length;

  const estado: Record<Puesto, EstadoPuesto> = {
    captacion: {
      activo: true,
      frase: total === 0 ? "Empiezo a buscar esta noche" : semana > 0 ? `Esta semana he traído ${n(semana)}` : `Tengo ${n(total)}. Busco más cada noche`,
      hechos: total,
      total: null,
      cifra: "infoproductores y coaches encontrados",
    },
    diagnostico: {
      activo: conDiagnostico < total,
      frase: total === 0 ? "Espero a que Leo traiga a alguien" : conDiagnostico < total ? `Me quedan ${n(total - conDiagnostico)} por mirar` : "Todos mirados",
      hechos: conDiagnostico,
      total,
      cifra: "con su problema apuntado",
    },
    guion: {
      activo: conGuion.length < total,
      frase: total === 0 ? "Espero a que Leo traiga a alguien" : conGuion.length < total ? `Me quedan ${n(total - conGuion.length)} por preparar` : "Todos tienen sus mensajes",
      hechos: conGuion.length,
      total,
      cifra: "con mensajes a medida",
    },
    oferta: {
      activo: conOferta.length < quieren.size,
      frase: quieren.size === 0 ? "Espero al primer interesado" : conOferta.length < quieren.size ? `${n(quieren.size - conOferta.length)} propuestas por escribir` : "Al día",
      hechos: conOferta.length,
      total: quieren.size,
      cifra: "propuestas escritas para interesados",
    },
    diseno: {
      activo: conDiseno.length < quieren.size,
      frase: quieren.size === 0 ? "Espero al primer interesado" : conDiseno.length < quieren.size ? `${n(quieren.size - conDiseno.length)} propuestas por montar` : "Al día",
      hechos: conDiseno.length,
      total: quieren.size,
      cifra: "propuestas visuales para interesados",
    },
  };

  // Lo que cada agente ha dejado hecho, lo más nuevo primero. Es lo que «se puede sacar» de él.
  const hechos: Record<Puesto, Hecho[]> = {
    captacion: lista.slice(0, 6).map((x) => ({ id: x.id, titulo: x.nombre, cuando: x.creado })),
    diagnostico: [...Map.groupBy(diagnosticos, (d) => d.negocio_id).values()].slice(0, 6).map((ds) => ({
      id: ds[0].negocio_id,
      titulo: nombre.get(ds[0].negocio_id) ?? "",
      detalle: ds.length > 1 ? `${ds[0].dolor} (y ${ds.length - 1} más)` : ds[0].dolor,
      cuando: ds[0].creado,
    })),
    guion: conGuion.slice(0, 6).map((p) => ({ id: p.negocio_id, titulo: nombre.get(p.negocio_id) ?? "", detalle: "Mensajes listos para copiar", cuando: p.actualizado })),
    oferta: conOferta.slice(0, 6).map((p) => ({ id: p.negocio_id, titulo: nombre.get(p.negocio_id) ?? "", detalle: "Propuesta escrita", cuando: p.actualizado })),
    diseno: conDiseno.slice(0, 6).map((p) => ({ id: p.negocio_id, titulo: nombre.get(p.negocio_id) ?? "", detalle: "Propuesta visual", cuando: p.actualizado })),
  };

  // Lo que espera para pasar de una mesa a la siguiente: es lo que se ve viajar en la oficina.
  const tramos: Tramo[] = [
    { de: "captacion", a: "diagnostico", esperan: total - conDiagnostico },
    { de: "diagnostico", a: "guion", esperan: Math.max(0, conDiagnostico - conGuion.length) },
    { de: "guion", a: "tu", esperan: porEscribir },
    { de: "tu", a: "oferta", esperan: quieren.size - conOferta.length },
    { de: "oferta", a: "diseno", esperan: Math.max(0, conOferta.length - conDiseno.length) },
  ];
  const enEscena = {
    ...Object.fromEntries(PUESTOS.map((p) => [p, { activo: estado[p].activo, frase: estado[p].frase }])),
    tu: { activo: porEscribir > 0, frase: `${n(porEscribir)} por escribir` },
  } as Record<Lugar, DatosPuesto>;

  const apuntes = ((diario ?? []) as { id: string; puesto: Puesto; texto: string; creado: string }[]).filter((a) => !elegido || a.puesto === elegido);

  return (
    <>
      <Titulo sub="Cada agente hace su parte y se la pasa al siguiente. Pincha en uno para ver qué está haciendo y qué puedes sacar de él." acciones={<PausaMovimiento />}>
        Oficina
      </Titulo>

      <OficinaIso puestos={enEscena} tramos={tramos} elegido={elegido} />

      <ul aria-label="Agentes de la oficina" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {PUESTOS.map((p) => {
          const e = estado[p];
          const sel = elegido === p;
          return (
            <li key={p} className="last:col-span-2 sm:last:col-span-1">
              <Link
                href={sel ? "/" : `/?puesto=${p}#detalle`}
                scroll={false}
                aria-current={sel ? "true" : undefined}
                className={cx("puesto flex h-full flex-col rounded-2xl border bg-bg p-3", sel ? "border-brand ring-2 ring-brand" : "border-line")}
              >
                <span className="font-[family-name:var(--font-titulo)] font-bold">
                  {PUESTO[p].nombre} <span className="font-[family-name:var(--font-sans)] text-sm font-medium text-muted">· {PUESTO[p].cargo}</span>
                </span>
                <span className="mt-1 text-sm leading-snug">{e.frase}</span>
                <span className={cx("mt-2 inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-bold", e.activo ? "tono-marca" : "tono-gris")}>{e.activo ? "Trabajando" : "Esperando"}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div id="detalle" className="mt-5 scroll-mt-4">
        {elegido ? (
          <FichaAgente p={elegido} e={estado[elegido]} hechos={hechos[elegido]} apuntes={apuntes} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 text-lg font-bold">Cómo vamos</h2>
              <div className="space-y-4">
                <Progreso valor={quieren.size} total={TESTERS} etiqueta="Interesados en la beta (objetivo: 10 testers)" />
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
        )}
      </div>

      <p className="mt-4 text-sm text-muted">Los agentes trabajan en una tanda cada noche y aquí ves lo que dejaron hecho. Los mensajes los mandas tú.</p>
    </>
  );
}

/** Lo que se ve al pinchar en un agente: qué hace, qué está haciendo ahora y qué te puede dar. */
function FichaAgente({ p, e, hechos, apuntes }: { p: Puesto; e: EstadoPuesto; hechos: Hecho[]; apuntes: { id: string; puesto: Puesto; texto: string; creado: string }[] }) {
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

function Diario({ titulo, apuntes }: { titulo: string; apuntes: { id: string; puesto: Puesto; texto: string; creado: string }[] }) {
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
