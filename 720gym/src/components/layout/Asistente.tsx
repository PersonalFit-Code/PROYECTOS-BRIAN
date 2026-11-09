"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Camera, Check, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { guardarConversacion, nuevoId, type MensajeChat } from "@/lib/demo";
import { ejecutar, type AccionChat } from "@/lib/asistente-ejecutor";
import { responderConAcciones, type EstadoLocal } from "@/lib/asistente-agente-local";

/**
 * ASISTENTE 720: chat que no solo responde, HACE: mira plazas y reserva, prepara el alta con el
 * enlace de pago, crea un plan de 4 semanas en PDF, rellena la ficha del cliente en el CRM y avisa
 * a la gerencia. Con clave de la API lo hace Claude con herramientas (tool use) y entiende fotos e
 * idiomas; sin clave, el motor local sigue los mismos flujos. Todo aparece al momento en el panel.
 * Se abre con su botón (escritorio), desde la barra del móvil o con el evento «abrir-asistente».
 */
interface Mensaje extends MensajeChat {
  acciones?: AccionChat[];
  sugerencias?: string[];
  hechos?: string[];
  imagen?: string;
}
type BloqueApi = Record<string, unknown>;
interface MensajeApi {
  role: "user" | "assistant";
  content: string | BloqueApi[];
}
interface RespuestaApi {
  motor?: "claude" | "local";
  contenido?: BloqueApi[];
  texto?: string;
  herramientas?: { id: string; nombre: string; entrada: Record<string, unknown> }[];
  reiniciar?: boolean;
}

const SUGERENCIAS = ["Reservar una clase", "Quiero apuntarme", "Hazme un plan de 4 semanas", "¿Cuánto cuesta?", "¿Qué horario tenéis?"];

/** Reduce la foto a 1280 px en JPEG antes de mandarla (rápido y barato). */
async function prepararImagen(archivo: File): Promise<string> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, ko) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = ko;
      i.src = url;
    });
    const k = Math.min(1, 1280 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
const SALUDO: Mensaje = {
  rol: "asistente",
  texto: "¡Hola! Soy el asistente de 720. Te reservo plaza, te doy de alta o te preparo un plan de 4 semanas gratis. También puedes mandarme una foto de tu rutina. ¿Por dónde empezamos?",
};

export default function Asistente() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);
  const id = useRef(nuevoId());
  const api = useRef<MensajeApi[]>([]);
  const estadoLocal = useRef<EstadoLocal>({});
  const archivo = useRef<HTMLInputElement>(null);
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

  /** Un turno con Claude: bucle de herramientas (máx. 6 vueltas) ejecutadas en el navegador. */
  async function turnoClaude(contenido: string | BloqueApi[]): Promise<Mensaje | null> {
    if (api.current.length > 40) api.current = [];
    api.current.push({ role: "user", content: contenido });
    const textos: string[] = [];
    const acciones: AccionChat[] = [];
    const hechos: string[] = [];
    for (let vuelta = 0; vuelta < 6; vuelta++) {
      const r = await fetch("/api/asistente", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mensajes: api.current }) });
      const j = (await r.json()) as RespuestaApi;
      if (j.motor !== "claude" || !j.contenido) {
        api.current.pop();
        return null;
      }
      api.current.push({ role: "assistant", content: j.contenido });
      if (j.texto) textos.push(j.texto);
      if (j.reiniciar) api.current = [];
      if (!j.herramientas?.length) break;
      const resultados: BloqueApi[] = [];
      for (const h of j.herramientas) {
        const res = await ejecutar(h.nombre, h.entrada, id.current);
        if (res.accion) acciones.push(res.accion);
        if (res.hecho) hechos.push(res.hecho);
        resultados.push({ type: "tool_result", tool_use_id: h.id, content: res.contenido, ...(res.error ? { is_error: true } : {}) });
      }
      api.current.push({ role: "user", content: resultados });
    }
    return { rol: "asistente", texto: textos.join("\n\n") || "Hecho. ¿Te ayudo con algo más?", acciones, hechos };
  }

  async function preguntar(pregunta: string) {
    const q = pregunta.trim();
    const foto = imagen;
    if ((!q && !foto) || escribiendo) return;
    setTexto("");
    setImagen(null);
    const historial: Mensaje[] = [...mensajes, { rol: "usuario", texto: q || "📷 Foto", imagen: foto ?? undefined }];
    setMensajes(historial);
    setEscribiendo(true);
    const contenido: string | BloqueApi[] = foto
      ? [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: foto.split(",")[1] } },
          { type: "text", text: q || "Te mando esta foto. ¿Qué me recomiendas?" },
        ]
      : q;
    let respuesta: Mensaje | null = null;
    try {
      respuesta = await turnoClaude(contenido);
    } catch {
      respuesta = null;
    }
    if (!respuesta) {
      const l = await responderConAcciones(q, estadoLocal.current, id.current, Boolean(foto));
      respuesta = { rol: "asistente", texto: l.texto, acciones: l.acciones, sugerencias: l.sugerencias, hechos: l.hechos };
      /* Pequeña pausa para que se lea como una conversación. */
      await new Promise((res) => setTimeout(res, 450));
    }
    const final = [...historial, respuesta];
    setMensajes(final);
    setEscribiendo(false);
    guardarConversacion({ id: id.current, inicio: new Date().toISOString(), mensajes: final.map(({ rol, texto }) => ({ rol, texto })) });
  }

  async function elegirFoto(f?: File) {
    if (!f || !f.type.startsWith("image/")) return;
    try {
      setImagen(await prepararImagen(f));
    } catch {}
    if (archivo.current) archivo.current.value = "";
    entrada.current?.focus();
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
            className="vidrio-fuerte hero-in mb-2 max-w-[15rem] rounded-2xl px-4 py-3 text-left text-[14px] leading-snug text-white"
          >
            <strong className="block">¿Te ayudo a elegir plan?</strong>
            <span className="text-white/75">Respondo al momento.</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Cerrar asistente" : "Abrir asistente"}
          aria-expanded={abierto}
          className="vidrio relative grid size-16 place-items-center rounded-full text-white transition-transform hover:scale-105"
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
          "vidrio-fuerte fixed z-[55] flex flex-col overflow-hidden text-white transition-[opacity,transform] duration-300",
          "inset-0 lg:inset-auto lg:right-6 lg:bottom-26 lg:h-[min(640px,calc(100svh-9rem))] lg:w-[400px] lg:rounded-[2rem]",
          abierto ? "visible translate-y-0 opacity-100" : "invisible translate-y-4 opacity-0",
        )}
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span className="marca grid size-11 place-items-center rounded-full bg-white text-[18px] text-negro">720</span>
          <div className="flex-1">
            <p className="subtitular text-[20px]">Asistente 720</p>
            <p className="flex items-center gap-1.5 text-[12px] text-white/55">
              <span className="size-2 rounded-full bg-[#25d366]" aria-hidden /> En línea · reserva, alta y planes al momento
            </p>
          </div>
          <button type="button" onClick={() => setAbierto(false)} className="grid size-10 place-items-center text-white/60 hover:text-white" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </header>

        <div ref={lista} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
          {mensajes.map((m, i) => (
            <div key={i} className={cn("flex flex-col", m.rol === "usuario" ? "items-end" : "items-start")}>
              {m.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.imagen} alt="Foto enviada" className="mb-1.5 max-h-44 max-w-[70%] rounded-2xl rounded-br-md object-cover" />
              )}
              {m.hechos?.map((h) => (
                <span key={h} className="hero-in mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#25d366]/15 px-3 py-1 text-[12.5px] font-semibold text-[#7ff0a8] ring-1 ring-[#25d366]/30">
                  <Check className="size-3.5" aria-hidden /> {h}
                </span>
              ))}
              <p
                className={cn(
                  "max-w-[85%] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line",
                  m.rol === "usuario" ? "rounded-2xl rounded-br-md bg-white text-negro" : "rounded-2xl rounded-bl-md bg-white/10 text-white",
                )}
              >
                {m.texto}
              </p>
              {m.acciones && m.acciones.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.acciones.map((a, j) =>
                    a.href.startsWith("http") || (j > 0 && !a.venta) ? (
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
          {!escribiendo && mensajes.length > 1 && mensajes[mensajes.length - 1].sugerencias?.length ? (
            <div className="flex flex-wrap gap-2">
              {mensajes[mensajes.length - 1].sugerencias!.map((sg) => (
                <button key={sg} type="button" onClick={() => preguntar(sg)} className="rounded-full bg-white/10 px-3.5 py-2 text-[13px] text-white ring-1 ring-white/15 transition hover:bg-white hover:text-negro active:scale-95">
                  {sg}
                </button>
              ))}
            </div>
          ) : null}
          {escribiendo && (
            <div className="flex gap-1.5 rounded-2xl bg-white/10 px-4 py-4" style={{ width: "fit-content" }} aria-label="Escribiendo">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </div>
          )}
          {mensajes.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGERENCIAS.map((s) => (
                <button key={s} type="button" onClick={() => preguntar(s)} className="rounded-full bg-white/10 px-3.5 py-2 text-[13px] text-white ring-1 ring-white/15 transition hover:bg-white hover:text-negro">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {imagen && (
          <div className="flex items-center gap-3 border-t border-white/10 px-4 pt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagen} alt="Foto lista para enviar" className="size-14 rounded-xl object-cover" />
            <p className="flex-1 text-[13px] text-white/65">Foto lista. Añade una pregunta o envíala tal cual.</p>
            <button type="button" onClick={() => setImagen(null)} className="grid size-9 place-items-center rounded-full bg-white/10" aria-label="Quitar la foto">
              <X className="size-4" />
            </button>
          </div>
        )}
        <form onSubmit={enviar} className="flex gap-2 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <input ref={archivo} type="file" accept="image/*" className="hidden" onChange={(e) => elegirFoto(e.target.files?.[0])} />
          <button type="button" onClick={() => archivo.current?.click()} className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20" aria-label="Enviar una foto">
            <Camera className="size-5" />
          </button>
          <label htmlFor="asistente-entrada" className="sr-only">
            Escribe tu pregunta
          </label>
          <input
            id="asistente-entrada"
            ref={entrada}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={500}
            placeholder="Escribe en tu idioma…"
            className="h-12 min-w-0 flex-1 rounded-full bg-white/10 px-5 text-[16px] outline-none ring-1 ring-white/15 placeholder:text-white/45 focus:ring-white"
          />
          <button type="submit" disabled={(!texto.trim() && !imagen) || escribiendo} className="grid size-12 place-items-center rounded-full bg-white text-negro transition disabled:opacity-40" aria-label="Enviar">
            <ArrowUp className="size-5" />
          </button>
        </form>
      </section>
    </>
  );
}
