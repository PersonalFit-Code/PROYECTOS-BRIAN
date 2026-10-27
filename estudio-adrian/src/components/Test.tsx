"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock, Home, RotateCcw, Sparkles, X } from "lucide-react";
import { EXAMEN, TEMA_DE_PREGUNTA, temaPorId, type Pregunta } from "@/data/temario";
import { leerProgreso, registrarRespuesta, registrarTest, type Correccion, type Modo } from "@/lib/progreso";
import { crearTest, formatoTiempo, LETRAS, type Errores } from "@/lib/test";
import Barra from "@/components/Barra";

type Props = { modo: Modo; temaId?: string; correccion: Correccion; errores: Errores; onRepetir: () => void };

/*
 * Dos maneras de hacer un test, como en la autoescuela:
 * - PRÁCTICA (tema y repaso de fallos): contestas y al momento ves si está
 *   bien y por qué. Es para aprender.
 * - EXAMEN: reloj en marcha, puedes ir y volver entre preguntas y cambiar
 *   respuestas, y no sabes nada hasta que corriges. Es para medirse.
 * El examen completo también se puede hacer en modo estudio: mismas
 * preguntas, pero con la corrección al momento y sin reloj.
 */
export default function Test({ modo, temaId, correccion, errores, onRepetir }: Props) {
  const esExamen = modo === "examen";
  /* `examen` = corrección al final y con reloj. */
  const examen = esExamen && correccion === "examen";
  const [preguntas] = useState<Pregunta[]>(() => crearTest(modo, temaId, leerProgreso(), errores));
  const [respuestas, setRespuestas] = useState<(number | null)[]>(() => preguntas.map(() => null));
  const [actual, setActual] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const [inicio] = useState(() => Date.now());
  const [ahora, setAhora] = useState(inicio);
  const cerrado = useRef(false);

  const fin = inicio + EXAMEN.minutos * 60_000;
  const restante = Math.max(0, Math.ceil((fin - ahora) / 1000));

  const titulo =
    esExamen ? (examen ? "Examen" : "Examen · modo estudio") : modo === "fallos" ? (errores === "todas" ? "Test de errores · todos" : "Test de errores") : (temaPorId(temaId ?? "")?.titulo ?? "Test");

  const terminar = useCallback(
    (finales: (number | null)[]) => {
      if (cerrado.current) return;
      cerrado.current = true;
      if (examen) {
        /* En examen la respuesta en blanco cuenta como fallo. */
        preguntas.forEach((p, i) => registrarRespuesta(p.id, finales[i] === p.correcta));
      }
      const aciertos = preguntas.filter((p, i) => finales[i] === p.correcta).length;
      registrarTest({
        fecha: Date.now(),
        modo,
        temaId,
        aciertos,
        total: preguntas.length,
        correccion: esExamen ? correccion : undefined,
        aprobado: esExamen ? preguntas.length - aciertos <= EXAMEN.fallosPermitidos : undefined,
        segundos: (Date.now() - inicio) / 1000,
      });
      setTerminado(true);
      window.scrollTo({ top: 0 });
    },
    [correccion, esExamen, examen, inicio, modo, preguntas, temaId],
  );

  /* Las respuestas al día para el reloj, sin reiniciar el intervalo en cada clic. */
  const respuestasRef = useRef(respuestas);
  useEffect(() => {
    respuestasRef.current = respuestas;
  }, [respuestas]);

  /* El reloj del examen. Si llega a cero, se corrige solo con lo que haya. */
  useEffect(() => {
    if (!examen || terminado) return;
    const id = setInterval(() => {
      const t = Date.now();
      setAhora(t);
      if (t >= fin) terminar(respuestasRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [examen, terminado, fin, terminar]);

  /* Cada pregunta empieza arriba del todo: en el móvil, tras leer una explicación larga, la
     siguiente aparecería a media pantalla. */
  useEffect(() => {
    window.scrollTo({ top: 0 });
    /* Y sin el resalte del toque anterior pegado a la opción que cae en el mismo sitio. */
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, [actual]);

  const pregunta = preguntas[actual];
  const elegida = respuestas[actual];
  const contestada = elegida !== null && elegida !== undefined;
  const corregida = !examen && contestada;
  const ultima = actual === preguntas.length - 1;

  const elegir = useCallback(
    (i: number) => {
      if (terminado || !pregunta || i >= pregunta.opciones.length) return;
      if (!examen && respuestas[actual] !== null) return;
      const nuevas = [...respuestas];
      nuevas[actual] = i;
      setRespuestas(nuevas);
      if (!examen) {
        const bien = i === pregunta.correcta;
        registrarRespuesta(pregunta.id, bien);
        /* Un toque de vibración al fallar (solo en los móviles que lo admiten, Android sobre todo). */
        if (!bien) navigator.vibrate?.(80);
      } else if (actual < preguntas.length - 1) {
        /* En examen, al contestar se pasa sola a la siguiente: con el pulgar es lo cómodo. Se puede
           volver atrás con la flecha o la cuadrícula para cambiarla. */
        const desde = actual;
        setTimeout(() => setActual((a) => (a === desde ? a + 1 : a)), 300);
      }
    },
    [actual, examen, pregunta, preguntas.length, respuestas, terminado],
  );

  const siguiente = useCallback(() => {
    if (ultima) {
      if (!examen) terminar(respuestas);
      return;
    }
    setActual((a) => a + 1);
  }, [examen, respuestas, terminar, ultima]);

  const corregir = useCallback(() => {
    const blanco = respuestas.filter((r) => r === null).length;
    if (blanco > 0 && !confirm(`Te ${blanco === 1 ? "queda 1 pregunta" : `quedan ${blanco} preguntas`} sin contestar y ${blanco === 1 ? "contará" : "contarán"} como fallo. ¿Corregir igualmente?`)) return;
    terminar(respuestas);
  }, [respuestas, terminar]);

  /* Teclado: 1-4 o A-D para contestar, Enter o → para seguir, ← para volver (examen). */
  useEffect(() => {
    if (terminado) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const num = "123456".indexOf(k);
      const letra = "abcdef".indexOf(k);
      if (num >= 0) elegir(num);
      else if (letra >= 0) elegir(letra);
      else if ((k === "enter" || k === "arrowright") && (examen || corregida)) {
        if (examen && ultima) return;
        e.preventDefault();
        siguiente();
      } else if (k === "arrowleft" && examen && actual > 0) setActual((a) => a - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actual, corregida, elegir, examen, siguiente, terminado, ultima]);

  if (preguntas.length === 0) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-lg font-semibold">
          {modo === "fallos" ? errores === "todas" ? "Todavía no has fallado ninguna pregunta." : "No tienes errores pendientes. ¡Bien hecho!" : "Este tema todavía no tiene preguntas."}
        </p>
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-primario px-5 py-3 font-semibold text-primario-tinta">
          <Home className="size-5" aria-hidden /> Volver al inicio
        </Link>
      </div>
    );
  }

  if (terminado) {
    return <Resultado modo={modo} titulo={titulo} preguntas={preguntas} respuestas={respuestas} onRepetir={onRepetir} />;
  }

  const aciertosHastaAhora = preguntas.filter((p, i) => respuestas[i] === p.correcta).length;
  const fallosHastaAhora = respuestas.filter((r) => r !== null).length - aciertosHastaAhora;
  const tema = TEMA_DE_PREGUNTA[pregunta.id];

  return (
    <main className="pb-28">
      {/* La cabecera se queda arriba al bajar: en el móvil siempre se ve el reloj o el marcador y por dónde va. */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-borde/60 bg-fondo/95 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          onClick={(e) => {
            if (respuestas.some((r) => r !== null) && !confirm("¿Salir del test? Lo que llevas contestado no cuenta como test hecho.")) e.preventDefault();
          }}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-borde bg-superficie"
          aria-label="Salir del test"
        >
          <X className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{titulo}</p>
          <p className="text-xs tabular-nums text-tinta-suave">
            Pregunta {actual + 1} de {preguntas.length}
          </p>
        </div>
        {examen ? (
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ${
              restante <= 60 ? "bg-mal-suave text-mal" : restante <= 300 ? "bg-aviso-suave text-aviso" : "bg-superficie-2"
            }`}
            aria-label={`Tiempo restante ${formatoTiempo(restante)}`}
          >
            <Clock className="size-4" aria-hidden />
            {formatoTiempo(restante)}
          </span>
        ) : (
          <span className="flex gap-1.5 text-sm font-semibold tabular-nums">
            <span className="flex items-center gap-1 rounded-full bg-bien-suave px-2.5 py-1 text-bien" aria-label={`${aciertosHastaAhora} aciertos`}>
              <Check className="size-4" aria-hidden /> {aciertosHastaAhora}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-mal-suave px-2.5 py-1 text-mal" aria-label={`${fallosHastaAhora} fallos`}>
              <X className="size-4" aria-hidden /> {fallosHastaAhora}
            </span>
          </span>
        )}
      </header>

      <Barra valor={actual + (contestada ? 1 : 0)} total={preguntas.length} className="mt-3" />
      </div>

      <article className="mt-6">
        {modo !== "tema" && tema && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primario">
            Tema {tema.numero} · {tema.titulo}
          </p>
        )}
        <h1 className="whitespace-pre-line text-xl font-semibold leading-snug">{pregunta.enunciado}</h1>
        {pregunta.imagen && (
          // eslint-disable-next-line @next/next/no-img-element -- imágenes del temario, tamaños variables
          <img src={pregunta.imagen} alt="" className="mt-4 max-h-64 w-auto rounded-xl border border-borde bg-white" />
        )}

        <ol className="mt-5 space-y-3">
          {pregunta.opciones.map((texto, i) => {
            const esElegida = elegida === i;
            const esCorrecta = i === pregunta.correcta;
            let estilo = "border-borde bg-superficie hover:border-primario";
            let insignia = "bg-superficie-2 text-tinta";
            if (examen && esElegida) {
              estilo = "border-primario bg-primario-suave";
              insignia = "bg-primario text-primario-tinta";
            } else if (corregida && esCorrecta) {
              estilo = "border-bien bg-bien-suave";
              insignia = "bg-bien text-white";
            } else if (corregida && esElegida) {
              estilo = "border-mal bg-mal-suave";
              insignia = "bg-mal text-white";
            } else if (corregida) {
              estilo = "border-borde bg-superficie opacity-60";
            }
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => elegir(i)}
                  disabled={corregida}
                  aria-pressed={esElegida}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 p-4 text-left text-[17px] transition active:scale-[0.99] disabled:active:scale-100 ${estilo}`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${insignia}`}>
                    {corregida && esCorrecta ? <Check className="size-4" aria-label="Correcta" /> : corregida && esElegida ? <X className="size-4" aria-label="Tu respuesta" /> : LETRAS[i]}
                  </span>
                  <span className="leading-snug">{texto}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {corregida && (
          <div
            role="status"
            className={`mt-5 rounded-2xl p-4 ${elegida === pregunta.correcta ? "bg-bien-suave" : "bg-mal-suave"}`}
          >
            <p className={`font-bold ${elegida === pregunta.correcta ? "text-bien" : "text-mal"}`}>
              {elegida === pregunta.correcta ? "¡Correcto!" : `Incorrecto. La buena es la ${LETRAS[pregunta.correcta]}.`}
            </p>
            {pregunta.explicacion && <p className="mt-1 leading-relaxed">{pregunta.explicacion}</p>}
            <EnlaceAsistente preguntaId={pregunta.id} />
          </div>
        )}
      </article>

      {examen && (
        <nav aria-label="Ir a una pregunta" className="mt-8">
          <p className="mb-2 text-sm text-tinta-suave">
            Contestadas {respuestas.filter((r) => r !== null).length} de {preguntas.length}
          </p>
          <ol className="grid grid-cols-7 gap-2 sm:grid-cols-10">
            {preguntas.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setActual(i)}
                  aria-current={i === actual}
                  aria-label={`Pregunta ${i + 1}${respuestas[i] !== null ? ", contestada" : ""}`}
                  className={`aspect-square w-full rounded-lg text-sm font-semibold tabular-nums ${
                    i === actual
                      ? "bg-primario text-primario-tinta"
                      : respuestas[i] !== null
                        ? "bg-primario-suave text-primario"
                        : "border border-borde bg-superficie text-tinta-suave"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-borde bg-fondo/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {examen ? (
            <>
              <button
                type="button"
                onClick={() => setActual((a) => a - 1)}
                disabled={actual === 0}
                className="grid size-12 shrink-0 place-items-center rounded-xl border border-borde bg-superficie disabled:opacity-40"
                aria-label="Pregunta anterior"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              {ultima ? (
                <button type="button" onClick={corregir} className="h-12 flex-1 rounded-xl bg-primario font-semibold text-primario-tinta">
                  Corregir examen
                </button>
              ) : (
                <>
                  <button type="button" onClick={corregir} className="h-12 rounded-xl border border-borde bg-superficie px-4 text-sm font-semibold">
                    Corregir
                  </button>
                  <button
                    type="button"
                    onClick={siguiente}
                    className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-primario font-semibold text-primario-tinta"
                  >
                    Siguiente <ChevronRight className="size-5" aria-hidden />
                  </button>
                </>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={siguiente}
              disabled={!contestada}
              className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-primario font-semibold text-primario-tinta disabled:opacity-40"
            >
              {ultima ? "Ver resultado" : "Siguiente"} <ChevronRight className="size-5" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Resultado({
  modo,
  titulo,
  preguntas,
  respuestas,
  onRepetir,
}: {
  modo: Modo;
  titulo: string;
  preguntas: Pregunta[];
  respuestas: (number | null)[];
  onRepetir: () => void;
}) {
  const [soloFallos, setSoloFallos] = useState(true);
  const aciertos = preguntas.filter((p, i) => respuestas[i] === p.correcta).length;
  const fallos = preguntas.length - aciertos;
  const examen = modo === "examen";
  const apto = fallos <= EXAMEN.fallosPermitidos;
  const nota = Math.round((aciertos / preguntas.length) * 100);

  const lista = preguntas.map((p, i) => ({ p, i, r: respuestas[i] })).filter(({ p, r }) => !soloFallos || r !== p.correcta);

  let mensaje: string;
  if (examen) mensaje = apto ? `Apto con ${fallos} ${fallos === 1 ? "fallo" : "fallos"}.` : `No apto: ${fallos} fallos y el máximo son ${EXAMEN.fallosPermitidos}.`;
  else if (fallos === 0) mensaje = "¡Pleno! Ni un fallo.";
  else if (nota >= 80) mensaje = "Muy bien. Repasa lo que se te ha escapado.";
  else if (nota >= 50) mensaje = "Vas por buen camino. Échale otro vistazo al tema.";
  else mensaje = "Toca repasar este tema con calma y volver a intentarlo.";

  return (
    <main className="space-y-6">
      <section
        className={`rounded-2xl p-6 text-center ${examen ? (apto ? "bg-bien-suave" : "bg-mal-suave") : "border border-borde bg-superficie"}`}
      >
        <p className="text-sm font-medium text-tinta-suave">{titulo}</p>
        {examen && <p className={`mt-1 text-4xl font-black tracking-tight ${apto ? "text-bien" : "text-mal"}`}>{apto ? "APTO" : "NO APTO"}</p>}
        <p className="mt-2 text-5xl font-bold tabular-nums">
          {aciertos}
          <span className="text-2xl text-tinta-suave">/{preguntas.length}</span>
        </p>
        <p className="mt-2">{mensaje}</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRepetir}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primario font-semibold text-primario-tinta"
        >
          <RotateCcw className="size-5" aria-hidden /> Otro test
        </button>
        <Link href="/" className="flex h-12 items-center justify-center gap-2 rounded-xl border border-borde bg-superficie font-semibold">
          <Home className="size-5" aria-hidden /> Inicio
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Revisión</h2>
          <div className="flex rounded-lg bg-superficie-2 p-1 text-sm" role="group" aria-label="Qué preguntas ver">
            {[
              { v: true, t: `Fallos (${fallos})` },
              { v: false, t: "Todas" },
            ].map(({ v, t }) => (
              <button
                key={t}
                type="button"
                onClick={() => setSoloFallos(v)}
                aria-pressed={soloFallos === v}
                className={`rounded-md px-3 py-1 font-medium ${soloFallos === v ? "bg-superficie shadow-sm" : "text-tinta-suave"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {lista.length === 0 ? (
          <p className="rounded-2xl border border-borde bg-superficie p-4 text-tinta-suave">Ningún fallo que revisar.</p>
        ) : (
          <ol className="space-y-3">
            {lista.map(({ p, i, r }) => {
              const bien = r === p.correcta;
              return (
                <li key={p.id} className="rounded-2xl border border-borde bg-superficie p-4">
                  <p className="text-xs font-semibold text-tinta-suave">Pregunta {i + 1}</p>
                  <p className="mt-1 whitespace-pre-line font-semibold leading-snug">{p.enunciado}</p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {!bien && (
                      <li className="flex gap-2 text-mal">
                        <X className="mt-0.5 size-4 shrink-0" aria-hidden />
                        <span>
                          {r === null ? "Sin contestar" : `Tu respuesta: ${LETRAS[r]}) ${p.opciones[r]}`}
                        </span>
                      </li>
                    )}
                    <li className="flex gap-2 text-bien">
                      <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>
                        {bien ? "Acertaste: " : "Correcta: "}
                        {LETRAS[p.correcta]}) {p.opciones[p.correcta]}
                      </span>
                    </li>
                  </ul>
                  {p.explicacion && <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{p.explicacion}</p>}
                  <EnlaceAsistente preguntaId={p.id} />
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}

/* Se abre en otra pestaña para no perder el test que está en marcha. */
function EnlaceAsistente({ preguntaId }: { preguntaId: string }) {
  return (
    <a
      href={`/asistente?pregunta=${preguntaId}`}
      target="_blank"
      rel="noopener"
      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primario"
    >
      <Sparkles className="size-4" aria-hidden /> Pregúntale al asistente
    </a>
  );
}
