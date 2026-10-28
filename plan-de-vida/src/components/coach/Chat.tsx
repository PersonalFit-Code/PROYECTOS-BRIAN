"use client";

import { ArrowUp, ChartColumn, CircleCheck, Compass, Fuel, Mic, RotateCcw, Sparkles, Target, TrendingUp, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/formato";

export interface MensajeChat {
  role: "user" | "assistant";
  content: string;
  acciones?: string[];
}

interface ReconocimientoVoz {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

const SUGERENCIAS: { texto: string; icono: LucideIcon }[] = [
  { texto: "¿Cómo voy este mes?", icono: ChartColumn },
  { texto: "Gasté 12 € en gasolina", icono: Fuel },
  { texto: "Hecho: gimnasio", icono: CircleCheck },
  { texto: "Hagamos mi revisión semanal", icono: Compass },
  { texto: "¿Qué dice el informe de inversión de hoy?", icono: TrendingUp },
  { texto: "Dame el plan de ataque para hoy", icono: Target },
];

/**
 * Chat del coach, al estilo del "¿Qué quieres hoy?" de Notion. Sin conversación muestra el saludo y
 * las sugerencias; con conversación, el hilo encima de la caja. El micro usa el dictado del navegador
 * (Chrome/Safari), así se pueden apuntar cosas hablando.
 */
export function Chat({ nombre, iniciales, preguntaInicial }: { nombre: string; iniciales: MensajeChat[]; preguntaInicial?: string }) {
  const router = useRouter();
  const [mensajes, setMensajes] = useState<MensajeChat[]>(iniciales);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [modo, setModo] = useState<"claude" | "basico" | null>(null);
  const voz = useRef<ReconocimientoVoz | null>(null);
  const final = useRef<HTMLDivElement>(null);
  const caja = useRef<HTMLTextAreaElement>(null);
  const enviada = useRef(false);

  useEffect(() => {
    final.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, pensando]);

  async function enviar(contenido: string) {
    const limpio = contenido.trim();
    if (!limpio || pensando) return;
    setTexto("");
    setMensajes((m) => [...m, { role: "user", content: limpio }]);
    setPensando(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mensaje: limpio }) });
      const data = (await res.json()) as { texto?: string; acciones?: string[]; modo?: "claude" | "basico"; error?: string };
      setMensajes((m) => [...m, { role: "assistant", content: data.texto ?? data.error ?? "No he podido responder.", acciones: data.acciones }]);
      if (data.modo) setModo(data.modo);
      if (data.acciones?.length) router.refresh();
    } catch {
      setMensajes((m) => [...m, { role: "assistant", content: "Sin conexión. Inténtalo en un momento." }]);
    } finally {
      setPensando(false);
      caja.current?.focus();
    }
  }

  // ?pregunta=… (desde Revisiones, atajos): se envía sola una vez.
  useEffect(() => {
    if (preguntaInicial && !enviada.current) {
      enviada.current = true;
      void enviar(preguntaInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preguntaInicial]);

  function dictar() {
    const w = window as unknown as { SpeechRecognition?: new () => ReconocimientoVoz; webkitSpeechRecognition?: new () => ReconocimientoVoz };
    const Clase = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Clase) {
      alert("Tu navegador no permite dictar. Prueba con Chrome o Safari.");
      return;
    }
    if (escuchando) {
      voz.current?.stop();
      return;
    }
    const r = new Clase();
    r.lang = "es-ES";
    r.interimResults = true;
    r.onresult = (e) => setTexto(Array.from(e.results, (x) => x[0].transcript).join(""));
    r.onend = () => setEscuchando(false);
    voz.current = r;
    setEscuchando(true);
    r.start();
  }

  async function reiniciar() {
    if (!confirm("¿Borrar la conversación con el coach?")) return;
    await fetch("/api/chat", { method: "DELETE" });
    setMensajes([]);
  }

  const vacio = mensajes.length === 0;

  return (
    <div className={cx("mx-auto flex w-full max-w-2xl flex-col", vacio ? "justify-center" : "min-h-[calc(100dvh-6rem)] justify-end")}>
      {vacio ? (
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-white/15 shadow-lg ring-1 ring-white/25 backdrop-blur">
            <Sparkles className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight drop-shadow sm:text-4xl">¿Qué toca hoy, {nombre}?</h1>
          <p className="mt-2 text-white/70">Cuéntame qué has hecho, qué has gastado o qué quieres conseguir.</p>
        </div>
      ) : (
        <div className="mb-4 space-y-3 pt-6">
          <div className="flex justify-end">
            <button onClick={reiniciar} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/70 hover:bg-white/10">
              <RotateCcw className="size-3.5" /> Nueva conversación
            </button>
          </div>
          {mensajes.map((m, i) => (
            <div key={i} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cx(
                  "entrar max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
                  m.role === "user" ? "bg-accent text-accent-fg" : "glass-strong text-fg",
                )}
              >
                {m.content}
                {m.acciones && m.acciones.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 border-t border-line pt-2">
                    {m.acciones.map((a, j) => (
                      <span key={j} className="rounded bg-hover px-1.5 py-0.5 text-xs text-muted">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {pensando && (
            <div className="flex">
              <div className="rounded-2xl bg-bg/95 px-4 py-3 text-muted shadow-sm">
                <span className="inline-flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-current" />
                  <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={final} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(texto);
        }}
        className="glass-strong sticky bottom-24 rounded-3xl p-3 md:bottom-6"
      >
        <textarea
          ref={caja}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void enviar(texto);
            }
          }}
          rows={vacio ? 3 : 1}
          placeholder={escuchando ? "Te escucho…" : "Escribe o dicta: «gasté 20 € en la cena», «¿cómo voy con mis metas?»…"}
          className="w-full resize-none bg-transparent px-1 text-[15px] outline-none placeholder:text-faint"
          aria-label="Mensaje para el coach"
        />
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-hover px-2 py-1 text-xs text-muted">
            <Sparkles className="size-3.5" /> Coach{modo === "basico" ? " · modo básico" : ""}
          </span>
          <button type="button" onClick={dictar} aria-label="Dictar" className={cx("ml-auto rounded-full p-2 hover:bg-hover", escuchando ? "text-bad" : "text-muted")}>
            <Mic className="size-5" />
          </button>
          <button type="submit" aria-label="Enviar" disabled={!texto.trim() || pensando} className="grid size-9 place-items-center rounded-full bg-accent text-accent-fg disabled:opacity-40">
            <ArrowUp className="size-5" />
          </button>
        </div>
      </form>

      {vacio && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SUGERENCIAS.map((sug) => (
            <button
              key={sug.texto}
              onClick={() => void enviar(sug.texto)}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-left text-sm text-white backdrop-blur transition hover:bg-white/20"
            >
              <sug.icono className="size-4 shrink-0" />
              <span className="line-clamp-2">{sug.texto}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
