"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronLeft, RotateCcw, Sparkles } from "lucide-react";
import { TEMA_DE_PREGUNTA, TODAS_LAS_PREGUNTAS } from "@/data/temario";
import { LIMITES } from "@/lib/asistente";

type Mensaje = { role: "user" | "assistant"; content: string };

/* La conversación se guarda en el navegador, como el progreso: al volver, sigue ahí. */
const CLAVE = "estudio-adrian:chat:v1";

const SUGERENCIAS = [
  "¿Qué diferencia hay entre una BIE de 25 mm y una de 45 mm?",
  "¿Qué mantenimiento lleva un extintor y quién lo hace?",
  "¿Qué diferencia hay entre un módulo monitor y uno de control?",
  "Explícame los detectores termovelocimétricos con un ejemplo",
];

export default function Asistente({ preguntaId }: { preguntaId?: string }) {
  const pregunta = preguntaId ? TODAS_LAS_PREGUNTAS.find((p) => p.id === preguntaId) : undefined;
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargado, setCargado] = useState(false);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const fin = useRef<HTMLDivElement>(null);

  /* Leer la conversación guardada solo en el navegador, después de montar. */
  useEffect(() => {
    let guardados: Mensaje[] = [];
    try {
      guardados = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
    } catch {
      /* sin almacenamiento: se empieza de cero */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe en el navegador
    setMensajes(Array.isArray(guardados) ? guardados : []);
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(mensajes.slice(-40)));
    } catch {
      /* lleno o bloqueado: la conversación sigue en memoria */
    }
  }, [mensajes, cargado]);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, pensando]);

  async function enviar(contenido: string) {
    const limpio = contenido.trim().slice(0, LIMITES.maxCaracteres);
    if (!limpio || pensando) return;
    setAviso(null);
    setTexto("");
    const historial: Mensaje[] = [...mensajes, { role: "user", content: limpio }];
    setMensajes(historial);
    setPensando(true);
    try {
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: historial.slice(-LIMITES.maxMensajes), preguntaId: pregunta?.id }),
      });
      if (!res.ok || !res.body) {
        const datos = await res.json().catch(() => null);
        throw new Error(datos?.error ?? "No he podido responder. Prueba otra vez.");
      }
      const lector = res.body.getReader();
      const dec = new TextDecoder();
      let respuesta = "";
      setMensajes([...historial, { role: "assistant", content: "" }]);
      setPensando(false);
      for (;;) {
        const { value, done } = await lector.read();
        if (done) break;
        respuesta += dec.decode(value, { stream: true });
        setMensajes([...historial, { role: "assistant", content: respuesta }]);
      }
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No he podido responder. Prueba otra vez.");
      /* Se devuelve la pregunta a la caja para poder reintentarla. */
      setMensajes(mensajes);
      setTexto(limpio);
    } finally {
      setPensando(false);
    }
  }

  const sugerencias = pregunta
    ? [
        `¿Por qué la respuesta es «${pregunta.opciones[pregunta.correcta]}»?`,
        "Explícamelo con un ejemplo práctico",
        "Dame un truco para acordarme",
      ]
    : SUGERENCIAS;

  return (
    <main className="flex min-h-[calc(100dvh-3rem)] flex-col pb-32">
      <header className="sticky top-0 z-10 -mx-4 flex items-center gap-3 border-b border-borde/60 bg-fondo/95 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
        <Link href="/" className="grid size-11 shrink-0 place-items-center rounded-full border border-borde bg-superficie" aria-label="Volver al inicio">
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-1.5 font-bold">
            <Sparkles className="size-4 text-primario" aria-hidden /> Asistente IA
          </h1>
          <p className="text-xs text-tinta-suave">Dudas del curso de incendios</p>
        </div>
        {mensajes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("¿Empezar una conversación nueva? Se borra la actual.")) setMensajes([]);
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-tinta-suave hover:text-tinta"
          >
            <RotateCcw className="size-4" aria-hidden /> Nueva
          </button>
        )}
      </header>

      {pregunta && (
        <div className="mt-4 rounded-2xl border border-primario/40 bg-primario-suave p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primario">
            Sobre la pregunta · Tema {TEMA_DE_PREGUNTA[pregunta.id]?.numero}
          </p>
          <p className="mt-1 line-clamp-3 whitespace-pre-line">{pregunta.enunciado}</p>
          <p className="mt-1 font-semibold">Solución: {pregunta.opciones[pregunta.correcta]}</p>
        </div>
      )}

      <div className="mt-4 flex-1 space-y-3" aria-live="polite">
        {cargado && mensajes.length === 0 && (
          <div className="pt-2">
            <p className="mb-3 text-tinta-suave">Pregúntame lo que no te quede claro del temario. Por ejemplo:</p>
            <ul className="space-y-2">
              {sugerencias.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => enviar(s)}
                    className="w-full rounded-2xl border border-borde bg-superficie px-4 py-3 text-left transition active:scale-[0.99]"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {mensajes.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-10 rounded-2xl rounded-br-md bg-primario px-4 py-2.5 text-primario-tinta whitespace-pre-wrap">
              {m.content}
            </div>
          ) : (
            <div key={i} className="mr-6 rounded-2xl rounded-bl-md border border-borde bg-superficie px-4 py-3 leading-relaxed">
              <Formato texto={m.content} />
            </div>
          ),
        )}
        {pensando && (
          <div className="mr-6 inline-flex gap-1 rounded-2xl border border-borde bg-superficie px-4 py-3" aria-label="Pensando">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2 animate-bounce rounded-full bg-tinta-suave" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        )}
        {aviso && <p className="rounded-xl bg-mal-suave px-4 py-3 text-sm text-mal">{aviso}</p>}
        <div ref={fin} />
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-borde bg-fondo/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(texto);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                /* Crece con el texto hasta unas 5 líneas. */
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              onKeyDown={(e) => {
                /* Con teclado físico, Enter envía. En el móvil Enter hace salto de línea y se envía con el botón. */
                if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
                  e.preventDefault();
                  enviar(texto);
                }
              }}
              enterKeyHint="send"
              rows={1}
              maxLength={LIMITES.maxCaracteres}
              placeholder="Escribe tu duda…"
              aria-label="Tu pregunta"
              className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl border border-borde bg-superficie px-4 py-3 text-base outline-none focus:border-primario"
            />
            <button
              type="submit"
              disabled={!texto.trim() || pensando}
              className="grid size-12 shrink-0 place-items-center rounded-xl bg-primario text-primario-tinta disabled:opacity-40"
              aria-label="Enviar"
            >
              <ArrowUp className="size-5" aria-hidden />
            </button>
          </form>
          <p className="mt-1.5 text-center text-[11px] text-tinta-suave">La IA puede equivocarse. Ante la duda, manda el temario y el profesor.</p>
        </div>
      </div>
    </main>
  );
}

/** Formato mínimo de las respuestas: párrafos, listas con guiones y **negrita**. */
/* La app no usa emojis: si el modelo cuela alguno, se quita al mostrarlo. */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;

function Formato({ texto }: { texto: string }) {
  const bloques = texto.replace(EMOJI, "").replace(/ {2,}/g, " ").split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {bloques.map((b, i) => {
        const lineas = b.split("\n");
        if (lineas.every((l) => /^\s*([-•*]|\d+\.)\s/.test(l) || !l.trim())) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lineas
                .filter((l) => l.trim())
                .map((l, j) => (
                  <li key={j}>
                    <Negrita texto={l.replace(/^\s*([-•*]|\d+\.)\s/, "")} />
                  </li>
                ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            <Negrita texto={b} />
          </p>
        );
      })}
    </div>
  );
}

function Negrita({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\*\*[^*]+\*\*)/).map((t, i) =>
        t.startsWith("**") && t.endsWith("**") ? <strong key={i}>{t.slice(2, -2)}</strong> : <Fragment key={i}>{t}</Fragment>,
      )}
    </>
  );
}
