"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { guardarConversacion, nuevoId, type MensajeChat } from "@/lib/demo";
import { responderLocal, type Accion } from "@/lib/asistente-local";

/**
 * ASISTENTE 720: chat en la web que responde al momento (horarios, precios, Pilates, alta…) y
 * empuja al siguiente paso con botones. Las conversaciones aparecen en el panel de gestión.
 * Se abre con su botón (escritorio), desde la barra del móvil o con el evento «abrir-asistente».
 */
interface Mensaje extends MensajeChat {
  acciones?: Accion[];
}

const SUGERENCIAS = ["¿Qué horario tenéis?", "¿Cuánto cuesta?", "Quiero probar gratis", "Pilates Reformer", "¿Dónde estáis?"];
const SALUDO: Mensaje = {
  rol: "asistente",
  texto: "¡Hola! Soy el asistente de 720. Pregúntame lo que quieras: horarios, precios, clases… o te doy de alta en un minuto.",
};

export default function Asistente() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState("");
  const id = useRef(nuevoId());
  const lista = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const abrir = () => setAbierto(true);
    window.addEventListener("abrir-asistente", abrir);
    /* Burbuja proactiva una vez por sesión, solo en escritorio. */
    let t = 0;
    try {
      if (!sessionStorage.getItem("720-aviso") && window.matchMedia("(min-width: 1024px)").matches) {
        t = window.setTimeout(() => setAviso(true), 9000);
      }
    } catch {}
    return () => {
      window.removeEventListener("abrir-asistente", abrir);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (abierto) {
      try {
        sessionStorage.setItem("720-aviso", "1");
      } catch {}
      window.setTimeout(() => entrada.current?.focus(), 250);
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, escribiendo]);

  async function preguntar(pregunta: string) {
    const q = pregunta.trim();
    if (!q || escribiendo) return;
    setTexto("");
    const historial: Mensaje[] = [...mensajes, { rol: "usuario", texto: q }];
    setMensajes(historial);
    setEscribiendo(true);
    let respuesta: Mensaje;
    try {
      const r = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: historial.filter((m) => m !== SALUDO).map(({ rol, texto }) => ({ rol, texto })) }),
      });
      const j = (await r.json()) as { texto?: string; acciones?: Accion[] };
      if (!j.texto) throw new Error();
      respuesta = { rol: "asistente", texto: j.texto, acciones: j.acciones };
    } catch {
      const l = responderLocal(q);
      respuesta = { rol: "asistente", texto: l.texto, acciones: l.acciones };
    }
    /* Pequeña pausa para que se lea como una conversación. */
    await new Promise((res) => setTimeout(res, 450));
    const final = [...historial, respuesta];
    setMensajes(final);
    setEscribiendo(false);
    guardarConversacion({ id: id.current, inicio: new Date().toISOString(), mensajes: final.map(({ rol, texto }) => ({ rol, texto })) });
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    preguntar(texto);
  }

  if (ruta.startsWith("/panel")) return null;

  return (
    <>
      {/* Lanzador (escritorio) */}
      <div className="fixed right-6 bottom-6 z-40 hidden items-end gap-3 lg:flex">
        {aviso && !abierto && (
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="hero-in mb-2 max-w-[15rem] bg-white px-4 py-3 text-left text-[14px] leading-snug text-negro shadow-2xl"
          >
            <strong className="block">¿Te ayudo a elegir plan?</strong>
            <span className="text-negro/60">Respondo al momento.</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Cerrar asistente" : "Abrir asistente"}
          aria-expanded={abierto}
          className="relative grid size-16 place-items-center rounded-full bg-white text-negro shadow-[0_14px_34px_-10px_rgb(0_0_0/0.6)] ring-1 ring-black/10 transition-transform hover:scale-105"
        >
          {abierto ? <X className="size-6" /> : <MessageCircle className="size-7" />}
          {!abierto && <span className="absolute top-1 right-1 size-3 animate-pulse rounded-full bg-[#25d366] ring-2 ring-white" aria-hidden />}
        </button>
      </div>

      {/* Ventana del chat */}
      <section
        role="dialog"
        aria-label="Asistente de 720 GYM CLUB"
        aria-modal="false"
        className={cn(
          "fixed z-[55] flex flex-col bg-negro text-white shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/10 transition-[opacity,transform] duration-300",
          "inset-0 lg:inset-auto lg:right-6 lg:bottom-26 lg:h-[min(640px,calc(100svh-9rem))] lg:w-[400px]",
          abierto ? "visible translate-y-0 opacity-100" : "invisible translate-y-4 opacity-0",
        )}
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span className="marca grid size-11 place-items-center rounded-full bg-white text-[18px] text-negro">720</span>
          <div className="flex-1">
            <p className="subtitular text-[20px]">Asistente 720</p>
            <p className="flex items-center gap-1.5 text-[12px] text-white/55">
              <span className="size-2 rounded-full bg-[#25d366]" aria-hidden /> En línea · responde al momento
            </p>
          </div>
          <button type="button" onClick={() => setAbierto(false)} className="grid size-10 place-items-center text-white/60 hover:text-white" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </header>

        <div ref={lista} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
          {mensajes.map((m, i) => (
            <div key={i} className={cn("flex flex-col", m.rol === "usuario" ? "items-end" : "items-start")}>
              <p
                className={cn(
                  "max-w-[85%] px-4 py-3 text-[15px] leading-relaxed",
                  m.rol === "usuario" ? "bg-white text-negro" : "bg-suelo text-white/90",
                )}
              >
                {m.texto}
              </p>
              {m.acciones && m.acciones.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.acciones.map((a, j) =>
                    a.href.startsWith("http") || j > 0 ? (
                      <a
                        key={a.href + a.etiqueta}
                        href={a.href}
                        {...(a.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        onClick={() => !a.href.startsWith("http") && setAbierto(false)}
                        className="boton-info subtitular inline-flex h-9 items-center gap-1 px-3 text-[14px] text-white"
                      >
                        {a.etiqueta}
                      </a>
                    ) : (
                      <Link key={a.href + a.etiqueta} href={a.href} onClick={() => setAbierto(false)} className="boton-venta subtitular inline-flex h-9 items-center gap-1 px-3 text-[14px]">
                        {a.etiqueta}
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
          {escribiendo && (
            <div className="flex gap-1.5 bg-suelo px-4 py-4" style={{ width: "fit-content" }} aria-label="Escribiendo">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </div>
          )}
          {mensajes.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGERENCIAS.map((s) => (
                <button key={s} type="button" onClick={() => preguntar(s)} className="bg-white/8 px-3 py-2 text-[13px] text-white/85 ring-1 ring-white/10 transition hover:bg-white hover:text-negro">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={enviar} className="flex gap-2 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <label htmlFor="asistente-entrada" className="sr-only">
            Escribe tu pregunta
          </label>
          <input
            id="asistente-entrada"
            ref={entrada}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={500}
            placeholder="Escribe tu pregunta…"
            className="h-12 flex-1 bg-suelo px-4 text-[16px] outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-white"
          />
          <button type="submit" disabled={!texto.trim() || escribiendo} className="grid size-12 place-items-center bg-white text-negro transition disabled:opacity-40" aria-label="Enviar">
            <ArrowUp className="size-5" />
          </button>
        </form>
      </section>
    </>
  );
}
