"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { RotateCcw, SendHorizontal, Sparkles, Square, WifiOff, X } from "lucide-react";
import { useChat } from "@/components/chat/ChatProvider";
import ChatMessageBubble from "@/components/chat/ChatMessage";
import { CHAT_LAUNCHER_ID } from "@/components/chat/ChatLauncher";
import { useChatSession } from "@/components/chat/useChatSession";
import { TMark } from "@/components/ui/Logo";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { CHAT_LIMITS } from "@/lib/waiter/types";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const WIDGET_ID = "tixola-chat-widget";

const iconButton =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full text-cream-200 transition-[background-color,color,transform] duration-300 ease-[var(--ease-out-expo)] hover:bg-cream/8 hover:text-cream active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light [&>svg]:h-5 [&>svg]:w-5";

/**
 * Panel del camarero virtual (abajo a la izquierda, sobre el lanzador). Cristal ahumado, cabecera con
 * la marca, lista de mensajes con markdown ligero, chips de preguntas rápidas, entrada con envío por
 * Intro y aviso legal. Se monta en el cliente desde ChatProvider (next/dynamic, ssr:false).
 */
export default function ChatWidget() {
  const m = useMessages();
  const locale = useLocale();
  const { isOpen, close, page, prefill, consumePrefill } = useChat();
  const { tier } = usePerformanceTier();
  const session = useChatSession({ locale, page });
  const { messages, status, mode, errorKind, send, retry, stop, reset } = session;

  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);

  const streaming = status === "streaming";

  /** Cierra y devuelve el foco al lanzador. */
  const handleClose = useCallback(() => {
    close();
    window.requestAnimationFrame(() => document.getElementById(CHAT_LAUNCHER_ID)?.focus({ preventScroll: true }));
  }, [close]);

  // Escape cierra (aunque el foco esté fuera del panel).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  // Al abrir, el foco entra en el panel (en la entrada de texto) una vez arrancada la animación.
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 160);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Prefill: la pregunta que trae `open({ prefill })` se envía sola. Se difiere con un temporizador
  // para que la cancelación del efecto (StrictMode, cierre inmediato) evite envíos duplicados.
  useEffect(() => {
    if (!isOpen || !prefill) return;
    const text = prefill;
    const timer = window.setTimeout(() => {
      consumePrefill();
      void send(text);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, prefill, consumePrefill, send]);

  // Auto-scroll al final mientras el usuario no haya subido a releer.
  useEffect(() => {
    const el = listRef.current;
    if (!el || !isOpen || !pinnedRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status, isOpen]);

  const onListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  }, []);

  const submit = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || streaming) return;
      pinnedRef.current = true;
      setDraft("");
      void send(clean);
      inputRef.current?.focus({ preventScroll: true });
    },
    [send, streaming],
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit(draft);
    }
  };

  const handleReset = () => {
    reset();
    setDraft("");
    inputRef.current?.focus({ preventScroll: true });
  };

  const lastAssistant = [...messages].reverse().find((msg) => msg.role === "assistant" && msg.status === "done");
  const modeNote = mode === "offline" ? m.chat.offlineNote : mode === "fallback" ? m.chat.fallbackNote : null;
  const canSend = draft.trim().length > 0 && !streaming;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="waiter-panel"
            id={WIDGET_ID}
            role="dialog"
            aria-modal="false"
            aria-label={m.chat.title}
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className={cn(
              "fixed left-4 z-[80] flex origin-bottom-left flex-col overflow-hidden rounded-3xl text-cream shadow-card",
              "bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-6",
              /* `svh` (no `dvh`): en iOS Safari la unidad dinámica cambia cada vez que se pliega o
                 despliega la barra de direcciones y el panel se recomponía a mitad de scroll. */
              "w-[min(420px,calc(100vw-2rem))] h-[min(640px,80svh)] max-h-[calc(100dvh-2rem)]",
              tier === "low" ? "border border-cream/10 bg-iron-900/[0.97]" : "glass-smoke",
            )}
          >
            {/* Cabecera */}
            <header className="flex items-center gap-3 border-b border-cream/10 px-4 py-3">
              <TMark size={40} decorative={false} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-caps text-[13px] uppercase tracking-[0.22em] text-cream">{m.chat.title}</h2>
                <p className="truncate font-sans text-[11px] text-cream-muted">{m.chat.subtitle}</p>
              </div>
              <button type="button" onClick={handleReset} className={iconButton} aria-label={m.chat.clear} title={m.chat.clear}>
                <RotateCcw aria-hidden />
              </button>
              <button type="button" onClick={handleClose} className={iconButton} aria-label={m.chat.closeAria} title={m.common.misc.close}>
                <X aria-hidden />
              </button>
            </header>

            {/* Nota de modo (sin conexión / respaldo) */}
            {modeNote && (
              <p className="flex items-start gap-2 border-b border-cream/10 bg-iron-900/60 px-4 py-2 font-sans text-[11px] leading-snug text-cream-muted">
                <WifiOff aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span>{modeNote}</span>
              </p>
            )}

            {/* Mensajes */}
            <div
              ref={listRef}
              onScroll={onListScroll}
              role="log"
              aria-label={m.chat.messagesLabel}
              data-lenis-prevent
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-gutter:stable]"
            >
              <ChatMessageBubble message={{ id: "welcome", role: "assistant", content: m.chat.welcome, status: "done", createdAt: 0 }} />
              {messages.map((msg, i) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  errorKind={msg.status === "error" ? errorKind : null}
                  onRetry={msg.status === "error" && i === messages.length - 1 ? () => void retry() : undefined}
                />
              ))}
            </div>

            {/* Anuncio para lectores de pantalla: "escribiendo…" y la última respuesta completa */}
            <p role="status" aria-live="polite" className="sr-only">
              {streaming ? m.chat.thinking : lastAssistant?.content ?? ""}
            </p>

            {/* Preguntas rápidas (al empezar y tras cada respuesta) */}
            {!streaming && (
              <div className="border-t border-cream/10 px-4 pt-3" role="group" aria-label={m.chat.quickRepliesLabel}>
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                  {m.chat.quickReplies.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submit(q)}
                      className="h-11 shrink-0 rounded-full border border-cream/12 bg-cream/5 px-4 font-sans text-xs font-medium text-cream-200 transition-[background-color,border-color,color] duration-300 hover:border-pimenton-light/60 hover:bg-pimenton/15 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Entrada */}
            <form onSubmit={onSubmit} className={cn("px-4 pb-2 pt-3", streaming && "border-t border-cream/10")}>
              <div className="flex items-end gap-2 rounded-2xl border border-cream/12 bg-iron-900/70 p-1.5 transition-[border-color] focus-within:border-pimenton-light/60">
                <label htmlFor="tixola-chat-input" className="sr-only">
                  {m.chat.inputLabel}
                </label>
                <textarea
                  id="tixola-chat-input"
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={m.chat.placeholder}
                  rows={1}
                  maxLength={CHAT_LIMITS.maxChars}
                  autoComplete="off"
                  enterKeyHint="send"
                  aria-describedby="tixola-chat-hint"
                  className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 font-sans text-[15px] leading-relaxed text-cream placeholder:text-cream-faint focus:outline-none [field-sizing:content]"
                />
                {streaming ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label={m.chat.stop}
                    title={m.chat.stop}
                    className={cn(iconButton, "border border-cream/15 bg-cream/5 text-cream")}
                  >
                    <Square aria-hidden className="h-4! w-4! fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canSend}
                    aria-label={m.chat.send}
                    title={m.chat.send}
                    className={cn(
                      iconButton,
                      "bg-pimenton text-cream shadow-[0_0_18px_rgba(178,30,39,0.45)] hover:bg-pimenton-light",
                      "disabled:cursor-not-allowed disabled:bg-cream/10 disabled:text-cream-faint disabled:shadow-none",
                    )}
                  >
                    <SendHorizontal aria-hidden />
                  </button>
                )}
              </div>
              <p id="tixola-chat-hint" className="sr-only">
                {m.chat.inputHint}
              </p>
            </form>

            {/* Pie: aviso + firma */}
            <footer className="flex items-center gap-2 px-4 pb-3 font-sans text-[11px] leading-snug text-cream-faint">
              <Sparkles aria-hidden className="h-3.5 w-3.5 shrink-0 text-gold/80" />
              <p className="min-w-0 flex-1">
                {m.chat.disclaimer} <span className="whitespace-nowrap text-cream-faint/80">· {m.chat.poweredBy}</span>
              </p>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
