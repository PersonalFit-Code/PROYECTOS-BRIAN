"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, ExternalLink, Phone, X } from "lucide-react";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";
import { useOpenStatus, useOpenStatusText } from "@/hooks/useOpenStatus";
import { CAMARERO, CAMARERO_IDS, CAMARERO_INICIO, buscaPregunta, type CamareroAccion, type CamareroId } from "@/data/camarero";
import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/cn";

type Msg =
  | { id: number; from: "bot"; kind: "greeting" }
  | { id: number; from: "bot"; kind: "fallback" }
  | { id: number; from: "bot"; kind: "answer"; item: CamareroId }
  | { id: number; from: "user"; text: string };

/** La pajarita del camarero: el icono del botón y del avatar. */
function Pajarita({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 20" className={className} fill="currentColor">
      <path d="M2.2 3.2 13 8v4L2.2 16.8Q-.4 10 2.2 3.2Z" />
      <path d="M29.8 3.2 19 8v4l10.8 4.8q2.6-6.8 0-13.6Z" />
      <rect x={12.6} y={6.4} width={6.8} height={7.2} rx={1.8} />
    </svg>
  );
}

function Avatar({ small = false }: { small?: boolean }) {
  return (
    <span aria-hidden className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-botella-900 text-oro ring-1 ring-oro/35", small ? "size-7" : "size-11")}>
      <Pajarita className={small ? "w-4" : "w-6"} />
    </span>
  );
}

const ENLACES: Record<Exclude<CamareroAccion, "call" | "maps">, string> = {
  carta: "/carta",
  vinos: "/vinos",
  historia: "/historia",
  visita: "/visita",
  preguntas: "/preguntas",
};

/**
 * El camarero virtual: preguntas fijas con respuestas de la casa (ver `data/camarero.ts`). Se
 * puede tocar una pregunta o escribir; lo escrito se compara en el propio navegador con las
 * palabras clave de cada pregunta y no se envía a ningún sitio. En el móvil ocupa la pantalla y
 * es modal; en escritorio flota en la esquina y deja leer la web.
 */
export default function Camarero() {
  const lp = useLocalePath();
  const t = useMessages().camarero;
  const reduced = useReducedMotion() ?? false;
  const status = useOpenStatus();
  const statusText = useOpenStatusText(status);

  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "bot", kind: "greeting" }]);
  const [typing, setTyping] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [draft, setDraft] = useState("");

  const nextId = useRef(1);
  const timer = useRef(0);
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const inputId = useId();
  const noteId = useId();

  const claves = useMemo(() => {
    const out = {} as Record<CamareroId, readonly string[]>;
    for (const id of CAMARERO_IDS) out[id] = t.items[id].keys;
    return out;
  }, [t]);

  /* Abierto: Escape cierra; en el móvil, el resto de la web queda inerte y sin scroll. */
  useEffect(() => {
    if (!open) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const f = window.setTimeout(() => (fine ? inputRef.current : panelRef.current)?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const shell = document.getElementById("app-shell");
    const prevOverflow = document.body.style.overflow;
    if (modal) {
      shell?.setAttribute("inert", "");
      document.body.style.overflow = "hidden";
    }
    const fab = fabRef.current;
    return () => {
      window.clearTimeout(f);
      window.removeEventListener("keydown", onKey);
      if (modal) {
        shell?.removeAttribute("inert");
        document.body.style.overflow = prevOverflow;
      }
      fab?.focus();
    };
  }, [open, modal]);

  /* Cada mensaje nuevo, al fondo de la conversación. */
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [msgs.length, typing, showAll, reduced]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const ask = (item: CamareroId | null, userText: string) => {
    window.clearTimeout(timer.current);
    setShowAll(false);
    const userId = nextId.current++;
    const botId = nextId.current++;
    setMsgs((prev) => [...prev, { id: userId, from: "user", text: userText }]);
    setTyping(true);
    timer.current = window.setTimeout(
      () => {
        setTyping(false);
        setMsgs((prev) => [...prev, item ? { id: botId, from: "bot", kind: "answer", item } : { id: botId, from: "bot", kind: "fallback" }]);
      },
      reduced ? 0 : 650,
    );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    ask(buscaPregunta(text, claves), text);
  };

  /* Qué preguntas se ofrecen: las de después de la última respuesta, sin repetir las ya hechas. */
  const asked = new Set(msgs.flatMap((x) => (x.from === "bot" && x.kind === "answer" ? [x.item] : [])));
  const last = msgs[msgs.length - 1];
  const base: readonly CamareroId[] = showAll ? CAMARERO_IDS : last.from === "bot" && last.kind === "answer" ? CAMARERO[last.item].luego : CAMARERO_INICIO;
  let sugerencias = showAll ? [...base] : base.filter((id) => !asked.has(id));
  if (!showAll && sugerencias.length < 3) sugerencias = [...sugerencias, ...CAMARERO_INICIO.filter((id) => !asked.has(id) && !sugerencias.includes(id))].slice(0, 3);

  const phone = BUSINESS.phone.display;
  const close = () => setOpen(false);

  const accion = (a: CamareroAccion): ReactNode => {
    const cls =
      "pulsable inline-flex min-h-9 items-center gap-1.5 rounded-full bg-cream/[0.08] px-3 text-[13px] font-medium text-cream ring-1 ring-cream/15 hover:ring-oro/45";
    if (a === "call")
      return (
        <a key={a} href={`tel:${BUSINESS.phone.e164}`} className={cls}>
          <Phone aria-hidden className="size-3.5 text-oro-light" />
          {t.actions.call}
        </a>
      );
    if (a === "maps")
      return (
        <a key={a} href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className={cls}>
          {t.actions.maps}
          <ExternalLink aria-hidden className="size-3.5 text-oro-light" />
        </a>
      );
    return (
      <Link key={a} href={lp(ENLACES[a])} onClick={close} className={cls}>
        {t.actions[a]}
      </Link>
    );
  };

  const respuesta = (msg: Exclude<Msg, { from: "user" }>): ReactNode => {
    if (msg.kind === "greeting") return <p>{t.greeting}</p>;
    if (msg.kind === "fallback")
      return (
        <>
          <p>{format(t.fallback, { phone })}</p>
          <div className="mt-3 flex flex-wrap gap-2">{accion("call")}</div>
        </>
      );
    const item = t.items[msg.item];
    const meta = CAMARERO[msg.item];
    return (
      <>
        {msg.item === "ahora" && statusText ? (
          <p className="mb-1.5 font-semibold text-cream">{format(t.nowLine, { label: statusText.label, detail: statusText.detail ? ` · ${statusText.detail}` : "" })}</p>
        ) : null}
        <p>{format(item.a, { phone })}</p>
        {meta.pending ? (
          <p className="mt-2 inline-flex rounded-full bg-oro/12 px-2.5 py-0.5 text-[11px] font-medium text-oro-a11y ring-1 ring-oro/30">{t.pending}</p>
        ) : null}
        {meta.acciones?.length ? <div className="mt-3 flex flex-wrap gap-2">{meta.acciones.map(accion)}</div> : null}
      </>
    );
  };

  const entra = reduced ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } };

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setModal(window.matchMedia("(max-width: 639px)").matches);
          setOpen(true);
        }}
        className={cn(
          "boton-camarero pulsable fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 inline-flex h-14 items-center gap-2.5 rounded-full bg-oro pr-2.5 pl-2.5 text-botella shadow-[0_18px_40px_-12px_rgba(0,0,0,0.85)] hover:bg-oro-light sm:right-6 sm:bottom-6 sm:pr-5",
          open && "invisible opacity-0",
        )}
      >
        <span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full bg-botella text-oro">
          <Pajarita className="w-5" />
        </span>
        <span className="sr-only text-[15px] font-semibold sm:not-sr-only">{t.open}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="camarero"
            ref={panelRef}
            role="dialog"
            aria-modal={modal}
            aria-labelledby={titleId}
            tabIndex={-1}
            className="fixed inset-x-2 top-[max(8px,env(safe-area-inset-top))] bottom-[max(8px,env(safe-area-inset-bottom))] z-50 flex origin-bottom-right flex-col overflow-hidden rounded-[28px] bg-botella-800 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] ring-1 ring-cream/12 outline-none sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(660px,calc(100dvh-48px))] sm:w-[400px]"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: reduced ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-cream/10 bg-botella-900/60 px-4 py-3">
              <Avatar />
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="font-display text-lg leading-tight font-medium">
                  {t.title}
                </h2>
                <p className="truncate text-xs text-cream-faint">{t.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t.close}
                className="pulsable inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.06] hover:border-oro/45"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>

            <div ref={logRef} role="log" aria-label={t.log} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
              {msgs.map((msg) =>
                msg.from === "user" ? (
                  <motion.div key={msg.id} {...entra} className="flex justify-end">
                    <p className="max-w-[82%] rounded-2xl rounded-tr-md bg-oro px-3.5 py-2 text-[14.5px] leading-snug text-botella">
                      <span className="sr-only">{t.you}: </span>
                      {msg.text}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key={msg.id} {...entra} className="flex items-start gap-2">
                    <Avatar small />
                    <div className="max-w-[86%] rounded-2xl rounded-tl-md bg-cream/[0.07] px-3.5 py-2.5 text-[14.5px] leading-relaxed text-cream/90 ring-1 ring-cream/10">
                      <span className="sr-only">{t.title}: </span>
                      {respuesta(msg)}
                    </div>
                  </motion.div>
                ),
              )}

              {typing ? (
                <div className="flex items-center gap-2">
                  <Avatar small />
                  <span className="inline-flex items-center gap-1 rounded-2xl rounded-tl-md bg-cream/[0.07] px-3.5 py-3 ring-1 ring-cream/10">
                    <span className="sr-only">{t.typing}</span>
                    {[0, 1, 2].map((i) => (
                      <span key={i} aria-hidden className="punto-escribiendo size-1.5 rounded-full bg-cream/70" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              ) : (
                <div className="pt-1 pl-9">
                  {showAll ? <p className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-oro-a11y uppercase">{t.others}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    {sugerencias.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => ask(id, t.items[id].q)}
                        className="pulsable inline-flex min-h-9 items-center rounded-full border border-oro/35 bg-oro/[0.08] px-3.5 py-1.5 text-left text-[13px] leading-snug text-oro-a11y hover:bg-oro/15"
                      >
                        {t.items[id].q}
                      </button>
                    ))}
                    {!showAll ? (
                      <button
                        type="button"
                        onClick={() => setShowAll(true)}
                        className="pulsable inline-flex min-h-9 items-center rounded-full px-3 text-[13px] font-medium text-cream-muted underline underline-offset-4 hover:text-cream"
                      >
                        {t.more}
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-cream/10 bg-botella-900/60 px-3 pt-3 pb-2.5">
              <div className="flex items-center gap-2 rounded-full bg-cream/[0.06] py-1 pr-1 pl-4 ring-1 ring-cream/12 focus-within:ring-oro/55">
                <label htmlFor={inputId} className="sr-only">
                  {t.placeholder}
                </label>
                <input
                  ref={inputRef}
                  id={inputId}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t.placeholder}
                  aria-describedby={noteId}
                  autoComplete="off"
                  enterKeyHint="send"
                  maxLength={160}
                  className="min-h-10 min-w-0 flex-1 bg-transparent text-[16px] text-cream outline-none placeholder:text-cream-faint campo-camarero"
                />
                <button
                  type="submit"
                  aria-label={t.send}
                  disabled={!draft.trim()}
                  className="pulsable inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-oro text-botella hover:bg-oro-light disabled:opacity-40"
                >
                  <ArrowUp aria-hidden className="size-5" />
                </button>
              </div>
              <p id={noteId} className="mt-2 px-2 text-[11px] leading-snug text-cream-faint">
                {t.note}
              </p>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
