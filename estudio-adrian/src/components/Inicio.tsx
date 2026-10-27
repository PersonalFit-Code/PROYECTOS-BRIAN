"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, ClipboardCheck, RotateCcw, Sparkles, Timer, Trash2 } from "lucide-react";
import { EXAMEN, TEMAS, TODAS_LAS_PREGUNTAS, temaPorId } from "@/data/temario";
import { borrarProgreso, guardarOrden, idsFalladas, idsFalladasAlgunaVez, useProgreso, type Orden, type TestHecho } from "@/lib/progreso";
import { formatoTiempo } from "@/lib/test";
import Barra from "@/components/Barra";

const IDS_VALIDOS = new Set(TODAS_LAS_PREGUNTAS.map((p) => p.id));

function nombreTest(t: TestHecho): string {
  if (t.modo === "examen") return t.correccion === "estudio" ? "Examen · modo estudio" : "Examen";
  if (t.modo === "fallos") return "Test de errores";
  const tema = t.temaId ? temaPorId(t.temaId) : undefined;
  return tema ? `Tema ${tema.numero} · ${tema.titulo}` : "Test de tema";
}

const fecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Inicio() {
  const progreso = useProgreso();
  const dominadas = TODAS_LAS_PREGUNTAS.filter((p) => progreso.preguntas[p.id]?.ultimaBien).length;
  const falladas = idsFalladas(progreso).filter((id) => IDS_VALIDOS.has(id)).length;
  const falladasAlgunaVez = idsFalladasAlgunaVez(progreso).filter((id) => IDS_VALIDOS.has(id)).length;
  /* Solo cuentan los exámenes de verdad, no los hechos en modo estudio. */
  const examenes = progreso.historial.filter((t) => t.modo === "examen" && t.correccion !== "estudio");
  const aprobados = examenes.filter((t) => t.aprobado).length;

  return (
    <main className="space-y-6">
      <header className="pt-2">
        <p className="text-sm font-medium text-tinta-suave">Curso de protección contra incendios</p>
        <h1 className="text-3xl font-bold tracking-tight">Hola, Adrián</h1>
      </header>

      <section aria-label="Tu progreso" className="rounded-2xl border border-borde bg-superficie p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-semibold">Preguntas dominadas</h2>
          <span className="text-sm tabular-nums text-tinta-suave">
            {dominadas} de {TODAS_LAS_PREGUNTAS.length}
          </span>
        </div>
        <Barra valor={dominadas} total={TODAS_LAS_PREGUNTAS.length} className="mt-2" />
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Dato titulo="Tests hechos" valor={progreso.historial.length} />
          <Dato titulo="Exámenes aprobados" valor={`${aprobados}/${examenes.length}`} />
          <Dato titulo="Por repasar" valor={falladas} />
        </dl>
      </section>

      <section aria-label="Orden de las preguntas">
        <h2 className="mb-2 text-sm font-semibold">Orden de las preguntas</h2>
        <div className="grid grid-cols-2 rounded-xl bg-superficie-2 p-1" role="group">
          {(
            [
              { v: "aleatorio", t: "Salteadas" },
              { v: "temario", t: "Por temario" },
            ] as { v: Orden; t: string }[]
          ).map(({ v, t }) => (
            <button
              key={v}
              type="button"
              onClick={() => guardarOrden(v)}
              aria-pressed={progreso.ajustes.orden === v}
              className={`rounded-lg px-3 py-2.5 font-medium ${progreso.ajustes.orden === v ? "bg-superficie shadow-sm" : "text-tinta-suave"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-primario p-4 text-primario-tinta shadow-sm">
        <h2 className="text-lg font-bold">Examen completo</h2>
        <p className="text-sm opacity-90">
          Las {Math.min(EXAMEN.preguntas, TODAS_LAS_PREGUNTAS.length)} preguntas de los {TEMAS.length} temas.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/test?modo=examen&correccion=estudio"
            className="flex flex-col items-start gap-1 rounded-xl bg-primario-tinta/15 p-3 transition active:scale-[0.98]"
          >
            <BookOpen className="size-6" aria-hidden />
            <span className="font-bold">Modo estudio</span>
            <span className="text-xs opacity-90">Ves la respuesta al momento, sin reloj.</span>
          </Link>
          <Link
            href="/test?modo=examen&correccion=examen"
            className="flex flex-col items-start gap-1 rounded-xl bg-primario-tinta/15 p-3 transition active:scale-[0.98]"
          >
            <Timer className="size-6" aria-hidden />
            <span className="font-bold">Modo examen</span>
            <span className="text-xs opacity-90">
              {EXAMEN.minutos} min, corriges al final, máx. {EXAMEN.fallosPermitidos} fallos.
            </span>
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-borde bg-superficie p-4">
        <div className="flex items-center gap-3">
          <RotateCcw className="size-7 shrink-0 text-mal" aria-hidden />
          <div>
            <h2 className="text-lg font-bold">Test de errores</h2>
            <p className="text-sm text-tinta-suave">Solo las preguntas que has fallado.</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <OpcionErrores
            href="/test?modo=fallos"
            titulo="Pendientes"
            detalle="Las que fallaste la última vez"
            cuantas={falladas}
          />
          <OpcionErrores
            href="/test?modo=fallos&errores=todas"
            titulo="Todas"
            detalle="Las que has fallado alguna vez"
            cuantas={falladasAlgunaVez}
          />
        </div>
      </section>

      <Link
        href="/asistente"
        className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie p-4 transition hover:border-primario active:scale-[0.99]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primario-suave text-primario">
          <Sparkles className="size-6" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold">Asistente IA</span>
          <span className="block text-sm text-tinta-suave">Pregúntale tus dudas sobre extintores, BIEs o detección.</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-tinta-suave" aria-hidden />
      </Link>

      <section>
        <h2 className="mb-3 text-lg font-bold">Temario</h2>
        <ul className="space-y-3">
          {TEMAS.map((tema) => {
            const vistas = tema.preguntas.filter((p) => progreso.preguntas[p.id]);
            const bien = tema.preguntas.filter((p) => progreso.preguntas[p.id]?.ultimaBien).length;
            return (
              <li key={tema.id}>
                <Link
                  href={`/test?modo=tema&tema=${tema.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie p-4 transition hover:border-primario active:scale-[0.99]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primario-suave text-lg font-bold text-primario">
                    {tema.numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug">{tema.titulo}</span>
                    <span className="block text-sm text-tinta-suave">{tema.descripcion}</span>
                    <Barra valor={bien} total={tema.preguntas.length} className="mt-2" />
                    <span className="mt-1 block text-xs tabular-nums text-tinta-suave">
                      {bien}/{tema.preguntas.length} dominadas
                      {vistas.length < tema.preguntas.length && ` · ${tema.preguntas.length - vistas.length} sin ver`}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-tinta-suave" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {progreso.historial.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Últimos tests</h2>
          <ul className="divide-y divide-borde overflow-hidden rounded-2xl border border-borde bg-superficie">
            {progreso.historial.slice(0, 8).map((t) => {
              const fallos = t.total - t.aciertos;
              const color = t.aprobado !== undefined ? (t.aprobado ? "text-bien" : "text-mal") : "text-tinta";
              return (
                <li key={t.fecha} className="flex items-center gap-3 px-4 py-3">
                  <ClipboardCheck className="size-5 shrink-0 text-tinta-suave" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{nombreTest(t)}</span>
                    <span className="block text-xs text-tinta-suave">
                      {fecha.format(t.fecha)} · {formatoTiempo(t.segundos)}
                    </span>
                  </span>
                  <span className={`text-right text-sm font-semibold tabular-nums ${color}`}>
                    {t.aciertos}/{t.total}
                    <span className="block text-xs font-normal text-tinta-suave">
                      {t.aprobado !== undefined ? (t.aprobado ? "Apto" : "No apto") : `${fallos} ${fallos === 1 ? "fallo" : "fallos"}`}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {progreso.historial.length > 0 && (
        <button
          type="button"
          onClick={() => {
            if (confirm("¿Borrar todo el progreso? No se puede deshacer.")) borrarProgreso();
          }}
          className="mx-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-tinta-suave hover:text-mal"
        >
          <Trash2 className="size-4" aria-hidden />
          Borrar progreso
        </button>
      )}
    </main>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string | number }) {
  return (
    <div className="rounded-xl bg-superficie-2 px-2 py-3">
      <dd className="text-xl font-bold tabular-nums">{valor}</dd>
      <dt className="text-xs text-tinta-suave">{titulo}</dt>
    </div>
  );
}

function OpcionErrores({ href, titulo, detalle, cuantas }: { href: string; titulo: string; detalle: string; cuantas: number }) {
  const contenido = (
    <>
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-bold">{titulo}</span>
        <span className="text-lg font-bold tabular-nums">{cuantas}</span>
      </span>
      <span className="block text-xs text-tinta-suave">{detalle}</span>
    </>
  );
  if (cuantas === 0) {
    return <div className="rounded-xl border border-dashed border-borde p-3 opacity-60">{contenido}</div>;
  }
  return (
    <Link href={href} className="rounded-xl border-2 border-mal bg-mal-suave p-3 transition active:scale-[0.98]">
      {contenido}
    </Link>
  );
}
