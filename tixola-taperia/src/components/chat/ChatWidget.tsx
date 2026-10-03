"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { RotateCcw, SendHorizontal, Sparkles, Square, WifiOff, X } from "lucide-react";
import { useChat } from "@/components/chat/ChatProvider";
import ChatMessageBubble from "@/components/chat/ChatMessage";
import { CHAT_LAUNCHER_ID } from "@/components/chat/ChatLauncher";
import { useChatSession } from "@/components/chat/useChatSession";
import { TMark } from "@/components/ui/Logo";
import { useKeyboardViewport } from "@/hooks/useKeyboardViewport";
import { useCoarsePointer, useIsMobile } from "@/hooks/useIsMobile";
import Link from "next/link";
import { useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { lockScroll } from "@/lib/scrollLock";
import { cn } from "@/lib/utils";
import { CHAT_LIMITS } from "@/lib/waiter/types";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const WIDGET_ID = "tixola-chat-widget";

/**
 * A qué se agarra la conversación cuando cambia de alto (cada fragmento que llega, el teclado que
 * sube o baja, las respuestas rápidas que aparecen):
 *  · "bottom" — pegada al final, como cualquier app de mensajería: lo último que se ha dicho.
 *  · "top"    — el PRINCIPIO de la respuesta que llega, clavado arriba del área de mensajes.
 *  · "free"   — manda quien lee: se ha ido a releer y no se le mueve nada bajo los dedos.
 */
type Follow = "bottom" | "top" | "free";

/* Aire entre el filo superior del área de mensajes y la burbuja que se deja arriba. Con 0 la burbuja
   quedaba pegada al borde de la cabecera y parecía cortada: se comía su sombra y su esquina
   redondeada. 12 px es el respiro justo, medio `py-4` de la lista, sin regalar una línea de texto. */
const TOP_GAP = 12;

/* Margen para dar por buena la posición "al final" (el de siempre, aquí solo con nombre). No es 0
   porque el dedo nunca para en el píxel exacto y porque mientras llega la respuesta el contenido
   crece bajo él: a cero, un par de píxeles de sobra bastaban para soltar el seguimiento. */
const BOTTOM_SLACK = 48;

/**
 * Cola del gesto, en milisegundos: tiempo tras el último `scroll` durante el que se sigue dando por
 * bueno que la lista la está moviendo una PERSONA. Cubre la inercia de iOS, que sigue emitiendo
 * eventos bastante después de levantar el dedo.
 */
const GESTURE_TAIL_MS = 500;

/**
 * Por debajo de este alto visible (px) el panel se considera ESTRECHO y se recoge lo prescindible.
 * Con el teclado arriba la ventana de lectura se quedaba en 111 px a 390 × 664 y en 40 px a 320 × 568
 * —dos líneas: mientras escribes no ves nada de lo que te acaban de contestar—. Las medidas previas
 * informaban del alto del PANEL (364 px) y no del de la lista, por eso nadie lo había visto.
 * El umbral separa limpiamente las dos situaciones reales: teclado abajo son 664 / 568 px y teclado
 * arriba 364 / 308.
 */
const TIGHT_PANEL_PX = 420;

const iconButton =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full text-cream-200 transition-[background-color,color,scale] duration-150 active:duration-100 ease-[var(--ease-out-expo)] hover:bg-cream/8 hover:text-cream active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light [&>svg]:h-5 [&>svg]:w-5";

/**
 * Panel del camarero virtual (abajo a la izquierda, sobre el lanzador). Cristal ahumado, cabecera con
 * la marca, lista de mensajes con markdown ligero, chips de preguntas rápidas, entrada con envío por
 * Intro y aviso legal. Se monta en el cliente desde ChatProvider (next/dynamic, ssr:false).
 */
export default function ChatWidget() {
  const m = useMessages();
  const locale = useLocale();
  const lp = useLocalePath();
  const privacidadHref = lp(`/legal/${m.legal.privacy.slug}`);
  const { isOpen, close, page, prefill, consumePrefill } = useChat();
  const session = useChatSession({ locale, page });
  const { messages, status, mode, errorKind, send, retry, stop, reset } = session;

  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const followRef = useRef<Follow>("bottom");

  /* Último `scrollTop` que hemos PEDIDO nosotros (-1 = ninguno todavía). `onScroll` no distingue el
     dedo del visitante de un reencuadre nuestro, y sin esta marca cada ajuste durante el streaming se
     leía como "se ha ido a releer" y desarmaba el seguimiento al primer fragmento.
     Se guarda lo pedido y no lo que quedó puesto porque el navegador RECORTA el desplazamiento al
     máximo posible, y ese máximo cambia solo: al bajar el teclado la lista crece, deja de haber nada
     que desplazar y el `scrollTop` cae a 0 disparando un `scroll` que nadie ha hecho con el dedo.
     Medido: era exactamente esto lo que devolvía la conversación al final justo después de enviar. */
  const autoWantRef = useRef(-1);

  /* "Este movimiento lo ha hecho una persona". `onScroll` no lo dice: llegan eventos que no ha
     provocado nadie con el dedo —el navegador reencaja `scrollTop` cuando el teclado cambia el alto
     de la lista, el anclaje de scroll del propio navegador recoloca al crecer el contenido de
     arriba— y cualquiera de ellos bastaba para que el criterio volviera a "bottom" en mitad del
     reencuadre. Ese era el fallo no determinista: 6 de 6 pasadas a 390 × 664 acababan clavadas al
     FINAL de la respuesta (scrollTop == scrollMax) mientras otras idénticas encuadraban a 12 px.
     Se arma con los gestos que de verdad mueven una lista (puntero, dedo, rueda, teclas) y se
     mantiene viva mientras sigan llegando eventos, para no cortar la inercia por la mitad. */
  const listGestureRef = useRef(false);
  const gestureTimerRef = useRef(0);

  /* La respuesta que se está esperando y la que ya se ha encuadrado. Ver el efecto de encuadre. */
  const pendingReplyRef = useRef(false);
  const framedRef = useRef<string | null>(null);

  /* Alto visible que deja el teclado (0 = sin medir todavía). */
  const [visibleHeight, setVisibleHeight] = useState(0);

  /* El panel, por referencia de estado (no `useRef`): el hook del teclado necesita que el efecto se
     vuelva a lanzar EN CUANTO el nodo existe, y un `ref` mutable no despierta a nadie al asignarse.
     El panel lo monta y lo desmonta `AnimatePresence`, así que el nodo aparece después del render. */
  const [panel, setPanel] = useState<HTMLElement | null>(null);

  /* A pantalla completa por debajo de `md`, como cualquier app de mensajería. La medida se toma una
     vez y no cambia sola: un móvil no se convierte en escritorio a mitad de conversación. */
  const fullscreen = useIsMobile(768);

  /* Soltar el foco tras enviar solo tiene sentido donde hay un teclado VIRTUAL que bajar, y eso lo
     dice el puntero, no el ancho: una ventana de escritorio estrechada por debajo de 768 px caía en
     la rama "móvil" y ahí el `blur()` no compra nada —no hay teclado que baje— y sí cuesta: con un
     teclado físico escribes, pulsas Intro y lo siguiente que tecleas no va a ninguna parte, hay que
     tabular tres paradas para volver a la entrada. */
  const coarsePointer = useCoarsePointer();
  const virtualKeyboard = fullscreen && coarsePointer;

  const streaming = status === "streaming";

  /** Apunta que la lista la está moviendo el usuario, y lo mantiene vivo durante la inercia. */
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
    /* El mensaje que llega es SIEMPRE el último de la lista, así que se busca por posición y no por
       identificador: marcar la burbuja obligaría a tocar ChatMessage.tsx, que está cerrado. */
    const arriving = el.lastElementChild;
    if (!(arriving instanceof HTMLElement)) return;
    scrollListTo(Math.max(0, arriving.offsetTop - TOP_GAP));
  }, [scrollListTo]);

  /* Teclado: el panel se ancla al hueco visible para que el cuadro de texto quede siempre encima de
     él. Solo en la maqueta de pantalla completa; en escritorio el panel flota y no hay teclado.
     Al subir o bajar el teclado la conversación cambia de alto y el encuadre deja de valer: se
     rehace el que toque (el final, o el principio de la respuesta). `syncScroll` ya no hace nada si
     manda quien lee. Se espera un fotograma porque la altura del panel la escribe el mismo hook en
     una variable CSS: midiendo antes, la lista aún tiene el alto viejo. */
  useKeyboardViewport(panel, isOpen && fullscreen, (height) => {
    setVisibleHeight(height);
    window.requestAnimationFrame(syncScroll);
  });

  /* Panel estrecho = teclado arriba en un teléfono bajo. Ver `TIGHT_PANEL_PX`. */
  const tightPanel = fullscreen && visibleHeight > 0 && visibleHeight < TIGHT_PANEL_PX;

  /* A pantalla completa el chat tapa la página entera: se congela el scroll de detrás (si no, el
     dedo que arrastra la conversación acaba moviendo la home) con el bloqueo contado que comparten
     todos los paneles. De regalo, `data-scroll-lock` deja quietas las animaciones de la portada. */
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

  /* Al abrir, el foco entra en el panel (en la entrada de texto) en el primer fotograma pintado.
     Con el temporizador de 160 ms el teclado del móvil no empezaba a subir hasta pasado ese tiempo:
     abrir el camarero se sentía lento aunque el panel ya estuviera en pantalla. */
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
      /* La pregunta que viene del detalle de plato no pasa por `submit`, pero su respuesta es tan
         "recién llegada" como cualquier otra: sin armar esto se quedaría pegada al final. */
      followRef.current = "bottom";
      pendingReplyRef.current = true;
      void send(text);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, prefill, consumePrefill, send]);

  /* Cada apertura empieza por el final: lo último que se dijo (la conversación se restaura de
     sessionStorage). El criterio no se hereda de la vez anterior que estuvo abierto el panel, y la
     última respuesta de la sesión anterior no cuenta como "recién llegada". */
  useLayoutEffect(() => {
    if (!isOpen) return;
    followRef.current = "bottom";
    autoWantRef.current = -1;
    pendingReplyRef.current = false;
    framedRef.current = messages[messages.length - 1]?.id ?? null;
    /* A propósito solo depende de `isOpen`: los mensajes se leen en el momento de abrir, no después. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* La respuesta que llega, identificada SIN mirar el estado del mensaje. Antes el criterio se armaba
     solo si la burbuja pasaba por `status === "streaming"`, y eso no siempre se ve: el motor sin
     conexión resuelve en memoria y el de respaldo devuelve el texto entero, así que React podía pintar
     el mensaje ya terminado en un único render y el reencuadre no llegaba a activarse nunca. De ahí la
     no determinación: en unas pasadas la lista quedaba clavada al final de la respuesta y en otras,
     con el mismo guion, encuadrada a 12 px del principio.
     Ahora el disparador es el que de verdad describe la situación: "el usuario ha preguntado y ha
     aparecido una burbuja del camarero que todavía no habíamos encuadrado". */
  const last = messages[messages.length - 1];
  const lastId = last?.id ?? null;
  const lastIsAssistant = last?.role === "assistant";

  /* Lo que pidió el cliente: "que el cliente, al escribir un mensaje, le cierre el teclado para ver
     la respuesta de arriba hacia abajo, en vez de tener que scrollear hacia arriba para leerlo bien
     desde un principio". Hasta ahora la conversación se quedaba pegada al final y de una respuesta
     larga solo se veía el último párrafo. Desde que nace la burbuja del camarero se le clava el
     PRINCIPIO arriba y el texto crece hacia abajo.
     No se persigue el final a propósito: cuando la respuesta pasa de pantalla, el borde superior de
     la burbuja ya no se mueve, así que el encuadre se queda quieto y baja quien lee, a su ritmo.
     La otra salida era seguir pegados al final y saltar arriba de golpe al terminar la respuesta,
     pero entonces el salto le cae encima a quien ya ha empezado a leer, y eso desorienta más que el
     problema que se venía a arreglar: por eso el encuadre se decide al nacer la burbuja y no al
     cerrarla.
     No se limita al móvil: la tarjeta de escritorio mide 640 px y sufre lo mismo. Lo que sí es solo
     de móvil es soltar el foco (ver `submit`), porque en escritorio se escribe seguido.
     El cambio de criterio va en el MISMO `useLayoutEffect` que el reencuadre y justo antes de él, para
     que el primer fotograma de la respuesta ya se pinte encuadrado.

     Reencuadre en cada cambio de la conversación (cada fragmento que llega lo es). `useLayoutEffect` y
     no `useEffect`, que era lo que había: el ajuste tiene que ir entre la medida y el pintado. Con
     `useEffect` se pinta primero la burbuja en su sitio "natural" y se corrige después, así que cada
     fragmento puede colar un fotograma movido; y son decenas por respuesta. */
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
       desplazamiento que cupo entero como el que se quedó en el tope (pedir `scrollHeight` para irse
       al final, o pedir un encuadre que ya no cabe porque la lista ha crecido al bajar el teclado).
       El margen de 1 px es porque `scrollTop` trae decimales en pantallas con escala. */
    const nuestro = Math.min(Math.max(autoWantRef.current, 0), max);
    if (autoWantRef.current >= 0 && Math.abs(el.scrollTop - nuestro) <= 1) return;
    autoWantRef.current = -1;
    /* Y si tampoco lo ha movido el dedo, NADIE ha cambiado de idea: el criterio se queda como estaba.
       Es la mitad que faltaba. La comparación de arriba reconoce nuestros propios desplazamientos,
       pero no los del navegador —reencaje de `scrollTop` al cambiar el teclado el alto de la lista,
       anclaje de scroll al crecer el contenido de arriba—, y esos llegaban con la lista en el final,
       así que la devolvían a "bottom" justo después de haberla encuadrado por arriba. */
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
         camarero, el efecto de arriba pasa el mando a "top". */
      followRef.current = "bottom";
      pendingReplyRef.current = true;
      setDraft("");
      void send(clean);

      if (!virtualKeyboard) {
        // Escritorio: aquí se escribe seguido y quitar el foco tras cada envío es una molestia.
        inputRef.current?.focus({ preventScroll: true });
        return;
      }

      /* Con teclado virtual (ver `virtualKeyboard`): soltar la entrada es lo único que lo baja (no hay
         API para cerrarlo), y es lo
         que devuelve media pantalla a la respuesta. El foco NO se deja en el aire: irse al `<body>`
         manda a quien navega con teclado al principio del documento, detrás del panel. Tampoco vale
         el botón de enviar, que se queda deshabilitado al vaciarse el borrador y además lo sustituye
         el de detener mientras llega la respuesta: el foco se perdería igual al desmontarse. El
         panel es el sitio estable —es el `role="dialog"` con nombre—, así que Tab sigue desde él y
         Escape sigue cerrando. `preventScroll` como en el resto del panel: enfocar un contenedor a
         pantalla completa arrastra la página de detrás, que es justo lo que el anclaje al
         `visualViewport` se encarga de evitar.
         El foco de APERTURA no se toca: sigue entrando en la entrada para que el teclado suba ya. */
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

  /* Vuelve a soltar el encuadre "por arriba" en cuanto el usuario se dispone a escribir otra cosa.
     Sin esto, el criterio no caducaba nunca: si la respuesta cabía entera y nadie tocaba la lista, el
     SIGUIENTE cambio de alto —tocar la entrada, que sube el teclado— reencuadraba clavando arriba la
     burbuja ANTERIOR y le movía la vista al usuario justo cuando iba a teclear. Solo suelta "top";
     el "bottom" de una apertura recién hecha no se toca (al abrir el foco también entra aquí). */
  const releaseFrame = useCallback(() => {
    if (followRef.current === "top") followRef.current = "free";
  }, []);

  const handleReset = () => {
    reset();
    // Sin mensajes no hay respuesta que encuadrar: se vuelve al criterio de partida.
    followRef.current = "bottom";
    pendingReplyRef.current = false;
    framedRef.current = null;
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
            /* Destino del foco tras enviar en móvil (ver `submit`): -1 para que sea enfocable a mano
               pero no entre en el recorrido del tabulador, donde sería una parada muda. */
            tabIndex={-1}
            data-lenis-prevent
            /* Las TRES propiedades van en las dos variantes, también las que una de ellas no mueve.
               `useIsMobile` contesta `false` hasta que monta (no hay ventana en el servidor), así que
               el primer render toma la variante de escritorio y el siguiente la de móvil: si la de
               móvil no nombrara `scale`, el 0,88 del `initial` de escritorio se quedaba puesto para
               siempre y la "pantalla completa" salía encogida al 88 %, con la página asomando
               alrededor. Nombrarlas todas cierra esa puerta. */
            initial={fullscreen ? { opacity: 0, scale: 1, y: "6%" } : { opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              fullscreen
                ? { opacity: 0, scale: 1, y: "6%", transition: { duration: 0.22, ease: EASE_OUT_EXPO } }
                : { opacity: 0, scale: 0.92, y: 16, transition: { duration: 0.25, ease: EASE_OUT_EXPO } }
            }
            /* 260 ms: es una transición de estado CON desplazamiento, el tramo alto del criterio de
               respuesta. Con 450 ms el panel seguía entrando cuando el usuario ya quería escribir. */
            transition={{ duration: 0.26, ease: EASE_OUT_EXPO }}
            ref={setPanel}
            className={cn(
              "fixed z-[80] flex flex-col overflow-hidden text-cream shadow-card",
              /* MÓVIL: hoja a pantalla completa, anclada al viewport VISIBLE. `--kb-height` y `--kb-top`
                 las escribe `useKeyboardViewport` en cada movimiento del teclado; sin ese hook (o sin
                 `visualViewport`) mandan los respaldos y se comporta como antes. Así el cuadro de texto
                 se queda pegado encima del teclado en vez de esconderse debajo. */
              "inset-x-0 top-[var(--kb-top,0px)] h-[var(--kb-height,100dvh)] origin-bottom",
              /* ESCRITORIO: la tarjeta flotante de siempre, abajo a la izquierda.
                 `svh` (no `dvh`): en iOS Safari la unidad dinámica cambia cada vez que se pliega o
                 despliega la barra de direcciones y el panel se recomponía a mitad de scroll. */
              "md:inset-x-auto md:left-4 md:top-auto md:origin-bottom-left md:rounded-3xl md:bottom-6",
              "md:w-[min(420px,calc(100vw-2rem))] md:h-[min(640px,80svh)] md:max-h-[calc(100dvh-2rem)]",
              /* Liquid Glass: el camarero es una hoja flotante SIN velo debajo, así que aquí el cristal
                 sí se ve. Fuerte (0,82): con texto encima pasa AA aunque por detrás quede blanco puro, y
                 también donde el navegador no aplica el desenfoque, que es lo que antes obligaba a poner
                 un telón opaco. */
              "liquid-glass liquid-glass-strong",
            )}
          >
            {/* Filo de luz superior */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cream/25 to-transparent" />

            {/* Cabecera */}
            <header className="relative flex items-center gap-3 border-b border-cream/10 px-4 py-3">
              <span className="relative shrink-0">
                <TMark size={40} decorative={false} />
                {/* Punto "al habla": el camarero responde ahora mismo */}
                <motion.span
                  aria-hidden
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-granate-900 bg-emerald-400"
                  animate={{ opacity: [0.65, 1, 0.65] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
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
              <p className="relative flex items-start gap-2 border-b border-cream/10 bg-granate-900/60 px-4 py-2 font-sans text-[11px] leading-snug text-cream-muted">
                <WifiOff aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span>{modeNote}</span>
              </p>
            )}

            {/* Mensajes */}
            <div
              ref={listRef}
              onScroll={onListScroll}
              /* Los cuatro gestos que mueven una lista. Van aquí y no en `window` porque lo que hay que
                 distinguir es quién mueve ESTA lista; `onKeyDown` cubre Av Pág / flechas con el foco
                 dentro, y `onPointerDown` cubre también arrastrar la barra de desplazamiento. */
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

            {/* Anuncio para lectores de pantalla: "escribiendo…" y la última respuesta completa */}
            <p role="status" aria-live="polite" className="sr-only">
              {streaming ? m.chat.thinking : lastAssistant?.content ?? ""}
            </p>

            {/* Preguntas rápidas (al empezar y tras cada respuesta). Se recogen con el panel estrecho:
                con el teclado arriba en un teléfono bajo son 56 px que le faltan a la ventana de
                lectura, y ahí se está escribiendo, no eligiendo pregunta hecha. Vuelven solas al bajar
                el teclado, que es cuando se leen. */}
            {!streaming && !tightPanel && (
              <div className="relative border-t border-cream/10 px-4 pt-3" role="group" aria-label={m.chat.quickRepliesLabel}>
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                  {m.chat.quickReplies.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submit(q)}
                      className="h-11 shrink-0 rounded-full border border-cream/12 bg-cream/5 px-4 font-sans text-xs font-medium text-cream-200 transition-[background-color,border-color,color,scale] duration-160 active:duration-100 ease-[var(--ease-out-expo)] hover:border-pimenton-light/60 hover:bg-pimenton/15 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Entrada */}
            <form onSubmit={onSubmit} className={cn("relative px-4 pb-2 pt-3", streaming && "border-t border-cream/10")}>
              <div className="flex items-end gap-2 rounded-2xl border border-cream/12 bg-granate-900/80 p-1.5 transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out-expo)] focus-within:border-pimenton-light/60 focus-within:shadow-[0_0_0_3px_rgba(158,22,24,0.16)]">
                <label htmlFor="tixola-chat-input" className="sr-only">
                  {m.chat.inputLabel}
                </label>
                <textarea
                  id="tixola-chat-input"
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
                      "bg-pimenton text-cream shadow-[0_0_18px_rgba(158,22,24,0.45)] hover:bg-pimenton-light",
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

            {/* Pie: aviso de alérgenos + primera capa de privacidad + firma.
                La primera capa (art. 13 RGPD) va AQUÍ, debajo de donde se escribe, y no solo en la
                política: la ley pide lo esencial en el momento de dar el dato, no a dos clics. */}
            <footer className="relative flex items-start gap-2 px-4 pb-3 font-sans text-[11px] leading-snug text-cream-faint /* A pantalla completa el pie llega al borde del teléfono: se respeta la franja del indicador de inicio. */ max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Sparkles aria-hidden className="mt-px h-3.5 w-3.5 shrink-0 text-gold/80" />
              <p className="min-w-0 flex-1">
                {m.chat.disclaimer} {m.chat.privacyNote}{" "}
                <Link href={privacidadHref} className="whitespace-nowrap underline underline-offset-2 transition-colors hover:text-cream">
                  {m.chat.privacyLink}
                </Link>{" "}
                <span className="whitespace-nowrap text-cream-faint/80">· {m.chat.poweredBy}</span>
              </p>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
