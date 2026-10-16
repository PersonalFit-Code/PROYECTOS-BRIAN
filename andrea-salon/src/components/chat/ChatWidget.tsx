"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { Info, RotateCcw, SendHorizontal, Sparkles, Square, X } from "lucide-react";
import { useChat } from "@/components/chat/ChatProvider";
import ChatMessageBubble, { AssistantAvatar } from "@/components/chat/ChatMessage";
import { CHAT_LAUNCHER_ID, CHAT_WIDGET_ID } from "@/components/chat/ChatLauncher";
import { useChatSession } from "@/components/chat/useChatSession";
import { useKeyboardViewport } from "@/hooks/useKeyboardViewport";
import { useCoarsePointer, useIsMobile } from "@/hooks/useIsMobile";
import { stripLocale } from "@/i18n/config";
import { useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { pageFromPath, CHAT_LIMITS } from "@/lib/asistente/types";
import { lockScroll } from "@/lib/scrollLock";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const INPUT_ID = "as-chat-input";
const HINT_ID = "as-chat-hint";

/**
 * A qué se agarra la conversación cuando cambia de alto (cada fragmento que llega, el teclado que
 * sube o baja, las respuestas rápidas que aparecen):
 *  · "bottom" — pegada al final, como cualquier app de mensajería.
 *  · "top"    — el PRINCIPIO de la respuesta que llega, clavado arriba del área de mensajes.
 *  · "free"   — manda quien lee: se ha ido a releer y no se le mueve nada bajo los dedos.
 */
type Follow = "bottom" | "top" | "free";

/* Aire entre el filo superior del área de mensajes y la burbuja que se deja arriba: con 0 la burbuja
   quedaba pegada al borde de la cabecera y parecía cortada. */
const TOP_GAP = 12;

/* Margen para dar por buena la posición «al final». No es 0 porque el dedo nunca para en el píxel
   exacto y porque mientras llega la respuesta el contenido crece bajo él. */
const BOTTOM_SLACK = 48;

/** Cola del gesto (ms): tiempo tras el último `scroll` en que se sigue dando por bueno que la lista la mueve una PERSONA (inercia de iOS). */
const GESTURE_TAIL_MS = 500;

/**
 * Por debajo de este alto visible (px) el panel se considera ESTRECHO (teclado arriba en un teléfono
 * bajo) y se recogen las respuestas rápidas: ahí se está escribiendo, no eligiendo pregunta hecha, y
 * son 56 px que le faltan a la ventana de lectura.
 */
const TIGHT_PANEL_PX = 420;

const iconButton =
  "pulsable grid h-11 w-11 shrink-0 place-items-center rounded-full text-tinta hover:bg-carmin/5 hover:text-carmin focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carmin [&>svg]:h-5 [&>svg]:w-5";

/**
 * Panel del asistente: hoja a pantalla completa en el móvil (anclada al hueco que deja el teclado) y
 * tarjeta flotante abajo a la izquierda en escritorio, sobre el lanzador. Cristal claro, cabecera con
 * el logo del salón, mensajes con markdown ligero, preguntas rápidas, entrada con envío por Intro y
 * la primera capa de privacidad al pie. Se monta en el cliente desde ChatProvider (sin SSR).
 *
 * La lógica de encuadre y de teclado es la de tixola, que se pulió a base de medir en teléfonos de
 * verdad; aquí solo cambian la piel y los textos.
 */
export default function ChatWidget() {
  const m = useMessages();
  const locale = useLocale();
  const lp = useLocalePath();
  const pathname = usePathname();
  const privacidadHref = lp(`/legal/${m.legal.privacy.slug}`);
  const { isOpen, close, conIA, prefill, consumePrefill } = useChat();
  const reducedMotion = useReducedMotion();

  /* La página se lee al ENVIAR (el panel sobrevive a la navegación). La función cambia con la ruta,
     y `useChatSession` la guarda en una referencia para no recrear el envío. */
  const getPage = useCallback(() => pageFromPath(stripLocale(pathname ?? "/").path), [pathname]);
  const session = useChatSession({ locale, getPage });
  const { messages, status, mode, errorKind, send, retry, stop, reset } = session;

  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const followRef = useRef<Follow>("bottom");

  /* Último `scrollTop` que hemos PEDIDO nosotros (-1 = ninguno). `onScroll` no distingue el dedo de un
     reencuadre nuestro; se guarda lo pedido y no lo que quedó, porque el navegador RECORTA el
     desplazamiento al máximo posible y ese máximo cambia solo (al bajar el teclado). */
  const autoWantRef = useRef(-1);

  /* «Este movimiento lo ha hecho una persona». Se arma con los gestos que de verdad mueven una lista
     (puntero, dedo, rueda, teclas) y se mantiene viva mientras sigan llegando eventos. Sin esto, los
     reencajes del propio navegador devolvían el criterio a "bottom" en mitad de un encuadre. */
  const listGestureRef = useRef(false);
  const gestureTimerRef = useRef(0);

  /* La respuesta que se está esperando y la que ya se ha encuadrado. Ver el efecto de encuadre. */
  const pendingReplyRef = useRef(false);
  const framedRef = useRef<string | null>(null);

  /* Alto visible que deja el teclado (0 = sin medir todavía). */
  const [visibleHeight, setVisibleHeight] = useState(0);

  /* El panel, por referencia de ESTADO (no `useRef`): el hook del teclado necesita volver a lanzarse
     en cuanto el nodo existe, y un `ref` mutable no despierta a nadie al asignarse. */
  const [panel, setPanel] = useState<HTMLElement | null>(null);

  /* A pantalla completa por debajo de `md`, como cualquier app de mensajería. */
  const fullscreen = useIsMobile(768);

  /* Soltar el foco tras enviar solo sirve donde hay un teclado VIRTUAL que bajar, y eso lo dice el
     puntero, no el ancho: en una ventana de escritorio estrecha quitar el foco solo estorba. */
  const coarsePointer = useCoarsePointer();
  const virtualKeyboard = fullscreen && coarsePointer;

  const streaming = status === "streaming";

  const markListGesture = useCallback(() => {
    listGestureRef.current = true;
    window.clearTimeout(gestureTimerRef.current);
    gestureTimerRef.current = window.setTimeout(() => {
      listGestureRef.current = false;
    }, GESTURE_TAIL_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(gestureTimerRef.current), []);

  /** Desplaza la lista dejando constancia de que el movimiento lo hemos pedido nosotros. */
  const scrollListTo = useCallback((top: number) => {
    const el = listRef.current;
    if (!el) return;
    autoWantRef.current = top;
    el.scrollTop = top;
  }, []);

  /** Vuelve a encuadrar la conversación según a qué se esté agarrando ahora mismo. */
  const syncScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    if (followRef.current === "bottom") {
      scrollListTo(el.scrollHeight);
      return;
    }
    if (followRef.current !== "top") return;
    /* El mensaje que llega es SIEMPRE el último de la lista: se busca por posición. */
    const arriving = el.lastElementChild;
    if (!(arriving instanceof HTMLElement)) return;
    scrollListTo(Math.max(0, arriving.offsetTop - TOP_GAP));
  }, [scrollListTo]);

  /* Teclado: el panel se ancla al hueco visible para que el cuadro de texto quede siempre encima de
     él. Solo a pantalla completa. Al cambiar el alto se rehace el encuadre, un fotograma después,
     porque la altura del panel la escribe el mismo hook en una variable CSS. */
  useKeyboardViewport(panel, isOpen && fullscreen, (height) => {
    setVisibleHeight(height);
    window.requestAnimationFrame(syncScroll);
  });

  const tightPanel = fullscreen && visibleHeight > 0 && visibleHeight < TIGHT_PANEL_PX;

  /* A pantalla completa el chat tapa la página entera: se congela el scroll de detrás con el bloqueo
     contado que comparten todos los paneles (y `data-scroll-lock` para la portada animada). */
  useEffect(() => {
    if (!isOpen || !fullscreen) return;
    return lockScroll();
  }, [isOpen, fullscreen]);

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

  /* Al abrir, el foco entra en la entrada de texto en el primer fotograma pintado, para que el teclado
     del móvil empiece a subir ya. */
  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  // Prefill: la pregunta que trae `open({ prefill })` se envía sola. Se difiere con un temporizador
  // para que la cancelación del efecto (StrictMode, cierre inmediato) evite envíos duplicados.
  useEffect(() => {
    if (!isOpen || !prefill) return;
    const text = prefill;
    const timer = window.setTimeout(() => {
      consumePrefill();
      followRef.current = "bottom";
      pendingReplyRef.current = true;
      void send(text);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, prefill, consumePrefill, send]);

  /* Cada apertura empieza por el final: lo último que se dijo. La última respuesta de la vez
     anterior no cuenta como «recién llegada». */
  useLayoutEffect(() => {
    if (!isOpen) return;
    followRef.current = "bottom";
    autoWantRef.current = -1;
    pendingReplyRef.current = false;
    framedRef.current = messages[messages.length - 1]?.id ?? null;
    /* A propósito solo depende de `isOpen`: los mensajes se leen en el momento de abrir, no después. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* La respuesta que llega, identificada SIN mirar el estado del mensaje: el motor sin IA puede pintar
     el mensaje ya terminado en un solo render. El disparador es «se ha preguntado y ha aparecido una
     burbuja del asistente que aún no habíamos encuadrado». */
  const last = messages[messages.length - 1];
  const lastId = last?.id ?? null;
  const lastIsAssistant = last?.role === "assistant";

  /* Desde que nace la burbuja del asistente se le clava el PRINCIPIO arriba y el texto crece hacia
     abajo: así una respuesta larga se lee desde el principio y no solo su último párrafo. No se
     persigue el final: cuando la respuesta pasa de pantalla, baja quien lee, a su ritmo.
     `useLayoutEffect` y no `useEffect`: el ajuste tiene que ir entre la medida y el pintado, o cada
     fragmento cuela un fotograma movido. */
  useLayoutEffect(() => {
    if (!isOpen) return;
    if (pendingReplyRef.current && lastIsAssistant && lastId && framedRef.current !== lastId) {
      framedRef.current = lastId;
      pendingReplyRef.current = false;
      followRef.current = "top";
    }
    syncScroll();
  }, [messages, status, isOpen, syncScroll, lastId, lastIsAssistant]);

  const onListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    /* Lo que pedimos, recortado como lo recorta el navegador: así se reconoce como nuestro tanto el
       desplazamiento que cupo entero como el que se quedó en el tope. 1 px por los decimales. */
    const nuestro = Math.min(Math.max(autoWantRef.current, 0), max);
    if (autoWantRef.current >= 0 && Math.abs(el.scrollTop - nuestro) <= 1) return;
    autoWantRef.current = -1;
    /* Y si tampoco lo ha movido el dedo, nadie ha cambiado de idea: el criterio se queda como estaba. */
    if (!listGestureRef.current) return;
    markListGesture();
    // Quien acaba en el final está siguiendo la conversación: se le vuelve a pegar a ella.
    followRef.current = max - el.scrollTop < BOTTOM_SLACK ? "bottom" : "free";
  }, [markListGesture]);

  const submit = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || streaming) return;
      /* Primero al final, para que la pregunta recién enviada se vea; en cuanto nazca la burbuja del
         asistente, el efecto de encuadre pasa el mando a "top". */
      followRef.current = "bottom";
      pendingReplyRef.current = true;
      setDraft("");
      void send(clean);

      if (!virtualKeyboard) {
        // Escritorio: aquí se escribe seguido y quitar el foco tras cada envío es una molestia.
        inputRef.current?.focus({ preventScroll: true });
        return;
      }

      /* Con teclado virtual, soltar la entrada es lo único que lo baja, y devuelve media pantalla a la
         respuesta. El foco va al panel (el `role="dialog"` con nombre), no al aire: así Tab sigue
         desde él y Escape sigue cerrando. */
      inputRef.current?.blur();
      panel?.focus({ preventScroll: true });
    },
    [send, streaming, virtualKeyboard, panel],
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

  /* Reintentar es otra respuesta que llega: se arma igual que un envío para que se encuadre por el
     principio, porque `retry()` crea un mensaje nuevo y no pasa por `submit`. */
  const handleRetry = useCallback(() => {
    followRef.current = "bottom";
    pendingReplyRef.current = true;
    void retry();
  }, [retry]);

  /* Suelta el encuadre «por arriba» en cuanto se va a escribir otra cosa: si no, el siguiente cambio
     de alto (el teclado que sube) clavaría arriba la burbuja ANTERIOR justo al teclear. */
  const releaseFrame = useCallback(() => {
    if (followRef.current === "top") followRef.current = "free";
  }, []);

  const handleReset = () => {
    reset();
    followRef.current = "bottom";
    pendingReplyRef.current = false;
    framedRef.current = null;
    setDraft("");
    inputRef.current?.focus({ preventScroll: true });
  };

  const lastAssistant = [...messages].reverse().find((msg) => msg.role === "assistant" && msg.status === "done");
  const canSend = draft.trim().length > 0 && !streaming;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="asistente-panel"
            id={CHAT_WIDGET_ID}
            role="dialog"
            aria-modal="false"
            aria-label={m.chat.title}
            /* Destino del foco tras enviar en móvil (ver `submit`): enfocable a mano pero fuera del
               recorrido del tabulador, donde sería una parada muda. */
            tabIndex={-1}
            data-lenis-prevent
            /* Las TRES propiedades en las dos variantes: `useIsMobile` dice `false` hasta montar, así
               que el primer render toma la de escritorio; si la de móvil no nombrara `scale`, el 0,88
               se quedaba puesto y la pantalla completa salía encogida. */
            initial={fullscreen ? { opacity: 0, scale: 1, y: "6%" } : { opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              fullscreen
                ? { opacity: 0, scale: 1, y: "6%", transition: { duration: 0.22, ease: EASE_OUT_EXPO } }
                : { opacity: 0, scale: 0.92, y: 16, transition: { duration: 0.25, ease: EASE_OUT_EXPO } }
            }
            transition={{ duration: 0.26, ease: EASE_OUT_EXPO }}
            ref={setPanel}
            className={cn(
              /* z-[80]: por encima de la cabecera (40), el aviso de cookies (50) y el menú lateral (60). */
              "fixed z-[80] flex flex-col overflow-hidden text-tinta shadow-card outline-none",
              /* MÓVIL: hoja a pantalla completa anclada al viewport VISIBLE (`--kb-*` las escribe
                 `useKeyboardViewport`; sin él mandan los respaldos). Tapa la barra inferior y el botón
                 de WhatsApp mientras está abierta, que es lo que se espera de una hoja así. */
              "inset-x-0 top-[var(--kb-top,0px)] h-[var(--kb-height,100dvh)] origin-bottom",
              /* ESCRITORIO: tarjeta flotante abajo a la izquierda, naciendo del lanzador. Lejos del
                 WhatsApp, que va centrado en el borde derecho. `svh` y no `dvh` en el alto: la unidad
                 dinámica de iOS cambia con la barra de direcciones y el panel se recompondría. */
              "md:inset-x-auto md:left-4 md:top-auto md:bottom-6 md:origin-bottom-left md:rounded-3xl",
              "md:w-[min(420px,calc(100vw-2rem))] md:h-[min(640px,80svh)] md:max-h-[calc(100dvh-2rem)]",
              /* Liquid Glass fuerte: lleva texto encima y flota sin velo debajo. En el móvil, a
                 pantalla completa, el fondo es crema macizo: no hay nada detrás que merezca verse. */
              "liquid-glass liquid-glass-strong max-md:[--glass-bg:var(--color-crema)]",
            )}
          >
            {/* Cabecera */}
            <header className="relative flex items-center gap-3 border-b border-carmin/10 px-4 py-3">
              <span className="relative shrink-0">
                <AssistantAvatar size={40} />
                {/* Punto «al habla»: el asistente responde ahora mismo. Quieto con menos movimiento. */}
                {reducedMotion ? (
                  <span aria-hidden className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                ) : (
                  <motion.span
                    aria-hidden
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                    animate={{ opacity: [0.65, 1, 0.65] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-[17px] font-semibold leading-tight text-tinta">{m.chat.title}</h2>
                <p className="truncate font-sans text-[12px] text-gris">{m.chat.subtitle}</p>
              </div>
              <button type="button" onClick={handleReset} className={iconButton} aria-label={m.chat.clear} title={m.chat.clear}>
                <RotateCcw aria-hidden />
              </button>
              <button type="button" onClick={handleClose} className={iconButton} aria-label={m.chat.closeAria} title={m.common.misc.close}>
                <X aria-hidden />
              </button>
            </header>

            {/* Nota de respaldo: solo si HAY IA y ha fallado. Sin clave, responder con las preguntas
                frecuentes es lo normal y no se avisa de ninguna avería. */}
            {mode === "fallback" && (
              <p className="relative flex items-start gap-2 border-b border-carmin/10 bg-rosa-niebla px-4 py-2 font-sans text-[12px] leading-snug text-tinta">
                <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-carmin" />
                <span>{m.chat.fallbackNote}</span>
              </p>
            )}

            {/* Mensajes */}
            <div
              ref={listRef}
              onScroll={onListScroll}
              /* Los cuatro gestos que mueven una lista; van aquí y no en `window` porque lo que hay que
                 distinguir es quién mueve ESTA lista. */
              onPointerDown={markListGesture}
              onTouchStart={markListGesture}
              onWheel={markListGesture}
              onKeyDown={markListGesture}
              role="log"
              aria-label={m.chat.messagesLabel}
              data-lenis-prevent
              className="relative min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-gutter:stable]"
            >
              <ChatMessageBubble message={{ id: "welcome", role: "assistant", content: m.chat.welcome, status: "done", createdAt: 0 }} />
              {messages.map((msg, i) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  errorKind={msg.status === "error" ? errorKind : null}
                  onRetry={msg.status === "error" && i === messages.length - 1 ? handleRetry : undefined}
                />
              ))}
            </div>

            {/* Anuncio para lectores de pantalla: «escribiendo…» y la última respuesta completa */}
            <p role="status" aria-live="polite" className="sr-only">
              {streaming ? m.chat.thinking : (lastAssistant?.content ?? "")}
            </p>

            {/* Preguntas rápidas (al empezar y tras cada respuesta). Se recogen con el panel estrecho
                (teclado arriba en un teléfono bajo) y vuelven solas al bajar el teclado. */}
            {!streaming && !tightPanel && (
              <div className="relative border-t border-carmin/10 px-4 pt-3" role="group" aria-label={m.chat.quickRepliesLabel}>
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                  {m.chat.quickReplies.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submit(q)}
                      className="pulsable h-11 shrink-0 rounded-full border border-carmin/15 bg-white px-4 font-sans text-[13px] font-medium text-tinta hover:border-carmin/40 hover:bg-rosa-niebla hover:text-carmin focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carmin"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Entrada */}
            <form onSubmit={onSubmit} className={cn("relative px-4 pb-2 pt-3", streaming && "border-t border-carmin/10")}>
              <div className="flex items-end gap-2 rounded-2xl border border-carmin/15 bg-white p-1.5 transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out-expo)] focus-within:border-carmin/50 focus-within:shadow-[0_0_0_3px_rgba(142,14,51,0.12)]">
                <label htmlFor={INPUT_ID} className="sr-only">
                  {m.chat.inputLabel}
                </label>
                <textarea
                  id={INPUT_ID}
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  onFocus={releaseFrame}
                  placeholder={m.chat.placeholder}
                  rows={1}
                  maxLength={CHAT_LIMITS.maxChars}
                  autoComplete="off"
                  enterKeyHint="send"
                  aria-describedby={HINT_ID}
                  /* 16 px en el móvil: por debajo, iOS hace zoom al enfocar el campo y descoloca la hoja.
                     El anillo de foco es el global de la web (`:focus-visible` en globals.css). */
                  className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 font-sans text-base leading-relaxed text-tinta placeholder:text-gris md:text-[15px] [field-sizing:content]"
                />
                {streaming ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label={m.chat.stop}
                    title={m.chat.stop}
                    className={cn(iconButton, "border border-carmin/20 bg-rosa-niebla text-carmin")}
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
                      "bg-carmin text-[var(--on-accent)] hover:bg-carmin-oscuro hover:text-[var(--on-accent)]",
                      "disabled:cursor-not-allowed disabled:bg-rosa disabled:text-gris disabled:hover:bg-rosa",
                    )}
                  >
                    <SendHorizontal aria-hidden />
                  </button>
                )}
              </div>
              <p id={HINT_ID} className="sr-only">
                {m.chat.inputHint}
              </p>
            </form>

            {/* Pie: aviso + primera capa de privacidad (art. 13 RGPD) + firma. Va AQUÍ, debajo de donde
                se escribe: la ley pide lo esencial en el momento de dar el dato, no a dos clics. Y dice
                lo que de verdad pasa con el texto, con IA o sin ella. A pantalla completa respeta la
                franja del indicador de inicio del teléfono. */}
            <footer className="relative flex items-start gap-2 px-4 pb-3 font-sans text-[11px] leading-snug text-gris max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Sparkles aria-hidden className="mt-px h-3.5 w-3.5 shrink-0 text-carmin-suave" />
              <p className="min-w-0 flex-1">
                {m.chat.disclaimer} {conIA ? m.chat.privacyNoteIA : m.chat.privacyNoteLocal}{" "}
                <Link href={privacidadHref} className="whitespace-nowrap font-semibold text-carmin underline underline-offset-2">
                  {m.chat.privacyLink}
                </Link>{" "}
                <span className="whitespace-nowrap">· {conIA ? m.chat.poweredByIA : m.chat.poweredByLocal}</span>
              </p>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
