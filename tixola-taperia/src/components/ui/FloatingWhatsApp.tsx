"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { motion, MotionConfig } from "framer-motion";
import { BUSINESS } from "@/data/business";
import { useCookieBannerOpen } from "@/components/legal/CookieConsent";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useScrollPastViewport } from "@/hooks/useScrollPast";
import { stripLocale } from "@/i18n/config";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * En la home y en móvil el botón espera a que el usuario haya bajado esta fracción del viewport:
 * así no se solapa con los CTAs a ancho completo de la portada en la primera impresión.
 */
const HOME_REVEAL_RATIO = 0.45;

/* ─────────────────────────────────────────────────────────────────────────────
   ALMACÉN "EL DEDO ESTÁ DESPLAZANDO"
   ─────────────────────────────────────────────────────────────────────────────
   Dos botones fijos sobre contenido a ancho completo SIEMPRE tapan algo: se probó una esquina para
   cada uno (se comían los nombres de plato y los botones de la barra inferior) y apilarlos a
   la derecha (caían sobre el precio de cada plato y, en el pie, sobre el copyright y "Volver
   arriba"). Ningún sitio está libre en la home, la carta y el pie a la vez, y encogerlos solo
   reduce el destrozo. La salida que usan las apps es no pelearse por el sitio: mientras el dedo
   desplaza, los flotantes se apartan, y vuelven cuando el usuario se queda quieto — justo cuando
   deja de leer y quiere pulsar.

   Este almacén NO mide nada: no lee `scrollY` ni nada del layout, solo apunta un booleano y
   reinicia un temporizador. Por eso no reutiliza el de `useScrollPast`, que publica posición
   (`{ y, vh }`) y avisa al cambiar, pero no tiene forma de decir cuándo se ha PARADO: haría falta
   este mismo temporizador encima de aquello.

   Vive en este módulo de `ui/` y no en `chat/` porque otras piezas de interfaz ya importan de aquí (el
   glifo): llevarlo al lanzador del camarero le metería `lucide-react` y el propio lanzador en el
   chunk del camarero virtual.
*/

/** Milisegundos quieto que hacen falta para que los flotantes vuelvan. */
const SCROLL_IDLE_MS = 600;

/**
 * Milisegundos sin eventos `scroll` tras los que se da la página por asentada y toca volver a mirar
 * qué ha quedado debajo de los discos. Es un temporizador APARTE del de arriba porque su disparador
 * también es otro: este atiende a CUALQUIER desplazamiento (incluido el que hace la propia página) y
 * aquel solo al del dedo.
 */
const SCROLL_SETTLE_MS = 180;

let isScrolling = false;
/* `true` mientras el desplazamiento lo está empujando una PERSONA (dedo o rueda). Sin esta marca, el
   almacén daba por "desplazando" cualquier evento `scroll`, y los hay a montones que nadie ha hecho:
   los enlaces de ancla (menú, barra, ScrollCue) desplazan por código, `SmoothScrollProvider` los
   interpola durante más de un segundo, ScrollTrigger emite más al asentar el anclaje de la portada, y
   al cerrarse el chat a pantalla completa se restaura la posición guardada. Medido a 390 × 664: tras
   un salto por JS los dos botones seguían apartados al SEXTO segundo (al séptimo con el indicador de
   la portada), cuando `SCROLL_IDLE_MS` promete 0,6 s — el temporizador se rearmaba solo. Y encima
   parpadeaban justo al cerrar el chat, que es el instante en el que el lanzador tiene que estar ahí
   para recibir el foco. Con la marca, un desplazamiento programático no los mueve. */
let fingerScroll = false;
let idleTimer = 0;
let settleTimer = 0;
const idleListeners = new Set<() => void>();
const settleListeners = new Set<() => void>();

function publishScrolling(next: boolean) {
  /* Solo se avisa en los dos cantos del gesto (arranca / para), no en cada tic: un scroll largo
     dispara decenas de eventos y cada aviso costaría un render por botón. */
  if (isScrolling === next) return;
  isScrolling = next;
  for (const listener of idleListeners) listener();
}

function onScrollTick() {
  /* Se haya movido quien se haya movido, lo que hay debajo de los discos ha cambiado. */
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => {
    for (const listener of settleListeners) listener();
  }, SCROLL_SETTLE_MS);

  if (!fingerScroll) return;
  publishScrolling(true);
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    fingerScroll = false;
    publishScrolling(false);
  }, SCROLL_IDLE_MS);
}

/* El gesto se arma con `touchmove`/`wheel` y NO con `pointerdown`: pulsar un enlace de ancla también
   es un `pointerdown` y volveríamos a contar como "dedo" el desplazamiento que hace la página. Lo
   que arrastra la página es el dedo MOVIÉNDOSE. La inercia posterior al soltar mantiene la marca viva
   porque cada `scroll` rearma el temporizador mientras siga puesta. */
function onFingerScroll() {
  fingerScroll = true;
  onScrollTick();
}

function attachScrollListeners() {
  window.addEventListener("scroll", onScrollTick, { passive: true });
  window.addEventListener("touchmove", onFingerScroll, { passive: true });
  window.addEventListener("wheel", onFingerScroll, { passive: true });
}

function detachScrollListeners() {
  window.removeEventListener("scroll", onScrollTick);
  window.removeEventListener("touchmove", onFingerScroll);
  window.removeEventListener("wheel", onFingerScroll);
  window.clearTimeout(idleTimer);
  window.clearTimeout(settleTimer);
  idleTimer = 0;
  settleTimer = 0;
  fingerScroll = false;
  /* Se vuelve al estado visible: si la página se remonta sin flotantes y luego los recupera,
     no deben nacer apartados por un gesto de hace media hora. */
  isScrolling = false;
}

/** Los dos conjuntos comparten los mismos tres oyentes de ventana: se ponen con el primer suscriptor
    de cualquiera de los dos y se quitan cuando no queda ninguno. */
function attachIfFirst(): void {
  if (idleListeners.size + settleListeners.size === 0) attachScrollListeners();
}
function detachIfLast(): void {
  if (idleListeners.size + settleListeners.size === 0) detachScrollListeners();
}

function subscribeScrollIdle(listener: () => void): () => void {
  attachIfFirst();
  idleListeners.add(listener);
  return () => {
    idleListeners.delete(listener);
    detachIfLast();
  };
}

function subscribeScrollSettled(listener: () => void): () => void {
  attachIfFirst();
  settleListeners.add(listener);
  return () => {
    settleListeners.delete(listener);
    detachIfLast();
  };
}

/**
 * `true` mientras el USUARIO está desplazando con el dedo o la rueda; vuelve a `false` tras
 * `SCROLL_IDLE_MS` quieto. Un desplazamiento hecho por código (enlace de ancla, restauración de
 * posición, asentado del anclaje) no lo enciende.
 * En servidor y en el primer render es `false` (los botones salen visibles en el HTML).
 * Lo consumen los DOS flotantes — el de WhatsApp y el del camarero — para apartarse a la vez.
 */
export function useIsScrolling(): boolean {
  return useSyncExternalStore(
    subscribeScrollIdle,
    () => isScrolling,
    () => false,
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   "¿HAY UN CONTROL DEBAJO DEL DISCO?"
   ─────────────────────────────────────────────────────────────────────────────
   Un botón `position: fixed` sobre un documento que se desplaza SIEMPRE acaba encima de algo: no hay
   sitio libre en un teléfono de 320-390 px y las tres rondas anteriores solo cambiaron QUÉ tapaban
   (primero los CTAs de la portada, luego el precio de cada plato, luego el copyright del pie). Lo que
   sí se puede quitar del todo es el daño que de verdad importa: que el disco caiga sobre algo que hay
   que PULSAR — la chip "¿Qué vino va con el pulpo?", la fila de un plato de la carta, el desplegable
   de alérgenos del FAQ, el enlace de las reseñas de Google. Ahí el disco no solo tapa: se come el
   toque.

   Así que en móvil los flotantes miran qué ha quedado debajo cuando la página se asienta y, si es un
   control, no vuelven. Se hace SOLO al asentarse (no en cada tic) y justo en el instante en el que ya
   estaban apartados por el gesto, de modo que el usuario no ve ningún parpadeo: simplemente no
   reaparecen donde estorbarían.

   Lo que NO hace: retirarse por texto corrido. Se probó y en /carta los discos desaparecían casi
   siempre —cada fila de plato es texto—, que equivale a no tener los botones. Tapar una línea de
   texto que se puede leer moviendo el pulgar es el precio de un botón flotante; robar un toque, no.

   Se descartaron por costosas o peores: meter los dos discos en la barra inferior (a 320 px no caben
   seis columnas: "RESERVAR" ya roza los 73 px que tiene hoy) y darles una franja propia sobre la
   barra (cuesta 44-48 px permanentes de pantalla, justo cuando el cliente se queja de que el CTA de
   la portada no entra en el primer pantallazo).
*/

/** Lo que cuenta como "control": si el disco cae aquí encima, no vuelve. */
const INTERACTIVE_SELECTOR =
  'a[href],button,input,select,textarea,summary,label,[role="button"],[role="link"],[role="tab"],[role="checkbox"],[role="switch"],[tabindex]:not([tabindex="-1"])';

/** Barrido de 3 × 3 puntos por la caja pulsable del disco (el mismo que usa el QA de solapes). */
function controlUnder(box: DOMRect): boolean {
  if (box.width < 2 || box.height < 2) return false;
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const x = box.left + 2 + ((box.width - 4) * i) / 2;
      const y = box.top + 2 + ((box.height - 4) * j) / 2;
      for (const node of document.elementsFromPoint(x, y)) {
        if (!(node instanceof HTMLElement)) continue;
        /* Nuestra propia capa y el cromo fijo no cuentan: la barra inferior tiene su hueco reservado
           en el `padding-bottom` del <body> y los discos van por encima de ella a propósito. */
        if (node.closest("[data-floating]") || node.closest("[data-mobile-bar]")) continue;
        if (node.closest(INTERACTIVE_SELECTOR)) return true;
      }
    }
  }
  return false;
}

/**
 * `true` cuando la caja pulsable de `ref` tiene un control del contenido debajo. Se recalcula al
 * asentarse la página, al cambiar de tamaño y al navegar; `enabled` en false contesta siempre `false`
 * (en escritorio los dos flotantes viven en márgenes libres y esto no se ejecuta).
 *
 * El nodo de `ref` tiene que estar QUIETO en su sitio de reposo: por eso la retirada (translate +
 * opacidad) vive en una capa interior y no en el envoltorio, que si se desplazara haría medir el
 * rectángulo 24-32 px corrido y contestar sobre un trozo de pantalla que no es el del botón.
 */
export function useControlUnderFloat(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  /**
   * Cualquier valor que, al cambiar, obligue a volver a mirar qué hay debajo.
   *
   * EXISTE POR UN FALLO REAL, y era el peor de los tres que arregló esta ronda: el aviso de cookies
   * es una capa fija que en el móvil cae JUSTO sobre los dos flotantes. La primera medición, hecha
   * al cargar, encontraba sus botones debajo y apartaba los discos — correcto. Pero al aceptar las
   * cookies el aviso desaparece y aquí no pasaba nada: esto solo se recalcula al asentarse un
   * desplazamiento, al cambiar el tamaño o al navegar, y aceptar cookies no es ninguna de las tres.
   * Resultado: en un teléfono, nada más entrar y aceptar, el camarero y el WhatsApp se quedaban
   * invisibles Y con `inert` puesto —ni se veían ni se podían pulsar— hasta que al visitante se le
   * ocurriera desplazar. Que es exactamente la queja de "en el móvil los iconos tardan en verse".
   */
  recalcularCon?: unknown,
): boolean {
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    /* La lectura va en un `requestAnimationFrame`: `elementsFromPoint` fuerza maqueta y encadenarlo al
       fotograma evita hacerlo en mitad de la ráfaga de eventos. */
    const check = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const el = ref.current;
        if (el) setBlocked(controlUnder(el.getBoundingClientRect()));
      });
    };
    check();
    const unsubscribe = subscribeScrollSettled(check);
    window.addEventListener("resize", check);
    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
      window.removeEventListener("resize", check);
    };
    /* `pathname` entra como dependencia para volver a mirar tras una navegación de cliente: el
       documento cambia entero sin que haya pasado un solo `scroll`. `recalcularCon`, por lo mismo:
       una capa fija que se quita tampoco mueve el scroll ni cambia la ruta. */
  }, [enabled, pathname, recalcularCon, ref]);

  /* Se contesta `false` en vez de reiniciar el estado desde el efecto: poner `setBlocked(false)` en el
     cuerpo del efecto encadena un render de más cada vez que `enabled` cambia (y lo hace al girar el
     teléfono o al cruzar los 768 px). El valor que quedara guardado no se lee. */
  return enabled && blocked;
}

/**
 * Alto, en píxeles, de la franja de abajo que ocupan los flotantes en móvil.
 *
 * Es el BORDE SUPERIOR DE LA CAJA PULSABLE, no el del disco: el `bottom-[calc(...)]` de los dos
 * botones deja el borde inferior del envoltorio a 64 (barra) + 8 (0,5rem) = 72 px, y dentro va un
 * `h-11` de 44 px —la zona pulsable—, así que la caja llega a 116. El disco de 36 px va centrado con
 * sus 4 px de margen transparente y llega a 112. El comentario anterior sumaba 64 + 8 + 36 = 108, o
 * sea el disco pegado a la barra, una geometría que no existe: el umbral avisaba 4-8 px tarde y la
 * última línea del pie podía quedar bajo el filo del disco antes de que los flotantes se retirasen.
 * Se toma la caja pulsable (116) y no la huella visual (112) porque es la que roba el toque.
 *
 * Deja fuera `env(safe-area-inset-bottom)` porque `rootMargin` no admite `env()`: el desfase es de
 * unos 34 px en un iPhone con indicador de inicio y solo adelanta un pelo el momento de retirarse.
 */
const FLOAT_BAND_PX = 64 + 8 + 44;

/**
 * `true` cuando el pie ya ha subido lo bastante como para quedar DEBAJO de los discos flotantes.
 *
 * Es el tercer motivo para apartarse y arregla la queja de la ronda anterior: la última línea del
 * pie lleva el copyright, el crédito de diseño y el botón "Volver arriba" justo en esa franja, y ahí
 * el apartado por scroll no sirve — el usuario ha llegado al final, se queda quieto y los botones
 * volverían encima. Retirarse del todo no deja a nadie sin contacto: el pie tiene teléfono, enlaces
 * y "Carta con alérgenos", y la barra inferior conserva Ver carta y Llamar.
 *
 * `IntersectionObserver` con el borde inferior de la raíz recortado esa franja: así el observador
 * avisa EXACTAMENTE cuando el pie empieza a quedar tapado, sin leer posiciones en cada tic.
 *
 * Se rearma con la ruta a propósito: el `<Footer>` se pinta dentro de cada página (`page.tsx`),
 * mientras que estos dos flotantes viven en el layout y no se desmontan al navegar. Con un efecto
 * de montaje único, tras la primera navegación de cliente el observador se quedaría mirando un nodo
 * ya desechado y la regla dejaría de dispararse en silencio.
 */
export function useFooterUnderFloats(): boolean {
  const pathname = usePathname();
  /* La ruta va DENTRO del estado, no en un `setState` de reinicio: así la lectura de una página
     anterior no vale para la actual, y mientras el observador nuevo no ha dado su primera respuesta
     (o si una página no tuviera pie) la respuesta es "no está tapado", que es el lado seguro —los
     botones se ven— y no un parpadeo heredado. */
  const [seen, setSeen] = useState({ path: "", covered: false });

  useEffect(() => {
    const footer = document.getElementById("footer");
    if (!footer) return;
    const path = pathname ?? "";
    const io = new IntersectionObserver(
      ([entry]) => setSeen({ path, covered: entry?.isIntersecting ?? false }),
      { rootMargin: `0px 0px -${FLOAT_BAND_PX}px 0px`, threshold: 0 },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, [pathname]);

  return seen.path === (pathname ?? "") && seen.covered;
}

/**
 * Transición común de los dos flotantes, y criterio del apartado por scroll que la usa.
 *
 * `motion-safe:` y no una comprobación en JS: con `prefers-reduced-motion: reduce` estas reglas
 * sencillamente no se escriben, así que los botones se quedan quietos y VISIBLES sin ramas ni
 * estados que mantener. Y solo `max-md:` porque en escritorio no se toca nada: allí el de WhatsApp
 * está a media altura del borde y el camarero en una esquina con margen de sobra, y además el
 * teclado también genera eventos de scroll (se esfumaría un botón mientras se tabula hacia él).
 * Se anima `opacity` y `translate` — nunca `bottom`/`right` — para no pedir maqueta en el gesto
 * más caro de la página.
 */
export const FLOATING_TRANSITION = "transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)]";

/** Glifo oficial de WhatsApp (trazado de Simple Icons, caja 24×24). */
const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

export interface WhatsAppGlyphProps {
  /** Medidas del glifo (clases de alto/ancho). Es una prop APARTE de `className` a propósito. */
  size?: string;
  /** Todo lo demás: color, opacidad, posición… */
  className?: string;
}

/**
 * El tamaño va en su propia prop y no mezclado con `className`. Las dos formas anteriores fallaban:
 * `cn("h-7 w-7", className)` solo concatena (aquí no hay tailwind-merge) y Tailwind emite `.h-7`
 * después de `.h-5`, así que un `h-5 w-5` del llamante perdía en la cascada; y `className ?? "h-7 w-7"`
 * arreglaba eso pero convertía el tamaño en todo-o-nada, de modo que quien pasara una clase sin
 * medidas (un `text-gold`, un `opacity-80`) se quedaba con un SVG sin alto ni ancho. Con dos props no
 * hay cascada que perder ni tamaño que se pueda borrar por accidente.
 */
export function WhatsAppGlyph({ size = "h-7 w-7", className }: WhatsAppGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(size, className)} aria-hidden fill="currentColor">
      <path d={WHATSAPP_PATH} />
    </svg>
  );
}

/**
 * Botón flotante de WhatsApp (pimentón, halo neón pulsante):
 *  - Escritorio (md+): pegado al borde derecho y centrado verticalmente, disco de 56 px. Intacto.
 *  - Móvil: esquina inferior DERECHA, pegado a la barra fija, con el camarero virtual enfrente en
 *    la esquina izquierda; disco de 36 px dentro de una zona pulsable de 44.
 * Se aparta en cinco casos, todos por la misma razón (no tapar algo que hay que leer o pulsar):
 * portada de la home a la vista, aviso de cookies abierto, pie a la vista, mientras el dedo desplaza
 * (ver `useIsScrolling`) y cuando al asentarse la página le ha quedado un CONTROL debajo (ver
 * `useControlUnderFloat`).
 * Se monta desde Navbar.tsx para aparecer en todas las páginas.
 */
export default function FloatingWhatsApp() {
  const m = useMessages();
  const pathname = usePathname();
  const isHome = stripLocale(pathname ?? "/").path === "/";
  /* Del almacén único de scroll (`useScrollPast`): este hook estaba duplicado carácter a carácter
     en ChatLauncher y Navbar tenía su propia versión. Un listener y un rAF para los tres. */
  const scrolled = useScrollPastViewport(HOME_REVEAL_RATIO);
  const mobile = useIsMobile(768);
  const scrolling = useIsScrolling();

  /* Oculto (solo < md) mientras la portada de la home está a la vista. Se resuelve con clases
     max-md:* para que el HTML del servidor ya salga correcto y no haya parpadeo al hidratar. */
  const heroHidden = isHome && !scrolled;
  /* El aviso de cookies ocupa todo el ancho y ~350 px de alto en móvil: taparía este botón. */
  const bannerOpen = useCookieBannerOpen();
  /* Tercer motivo para retirarse, el del pie (ver `useFooterUnderFloats`). */
  const footerUnder = useFooterUnderFloats();
  const covered = (bannerOpen || footerUnder) && mobile;

  /* `animate-ping` es una animación SIN FIN: mientras se ve, el compositor recompone el halo en cada
     fotograma durante toda la sesión. Su trabajo es llamar la atención una vez, así que se apaga en
     cuanto el usuario se acerca al botón (puntero, foco o pulsación) — el mismo criterio que usa
     ChatLauncher con `hasOpened` — y no se pinta si el botón está apartado. */
  const [noticed, setNoticed] = useState(false);
  const notice = useCallback(() => setNoticed(true), []);

  /* Cuarto motivo para apartarse, y el que de verdad faltaba: que el disco haya ido a caer sobre un
     control del contenido (ver `useControlUnderFloat`). Se mide sobre el envoltorio, que se queda
     SIEMPRE en su sitio de reposo.
     Va en TODAS las pantallas, no solo en móvil. La suposición de que "en escritorio los flotantes
     viven en márgenes libres" era falsa y se pudo medir: en `/carta`, entre 1024 y 1440 px y antes
     de desplazar, este disco cae sobre los últimos 32 px del botón "Filtros" — o sea que un clic en
     esa esquina abre WhatsApp en vez del panel de filtros. Nadie lo vio porque la portada reventaba
     en escritorio y todas las capturas se hicieron a 390 px. La maquinaria ya estaba escrita; lo
     único que faltaba era dejarla trabajar aquí. */
  const boxRef = useRef<HTMLDivElement>(null);
  const overControl = useControlUnderFloat(boxRef, true, bannerOpen);

  const hidden = (heroHidden && mobile) || covered || overControl;
  const pinging = !noticed && !hidden;

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={boxRef}
        /* Marca la capa flotante (mismo criterio que el `data-mobile-bar` de la barra inferior): el QA
           de solapes la descuelga para leer con `elementsFromPoint` qué hay DEBAJO de cada botón. */
        data-floating="whatsapp"
        inert={hidden ? true : undefined}
        className={cn(
          /* ESTA CAJA NO SE MUEVE NUNCA. Es la posición de reposo del botón y nada más: el apartado
             (desplazamiento + opacidad) vive en la capa de dentro. Antes iba todo junto aquí, y al
             medir el rectángulo para saber qué había debajo se leía el botón ya corrido 24-32 px, o
             sea un trozo de pantalla que no era el suyo. */
          "fixed right-3 z-40",
          /* MÓVIL: esquina inferior derecha, pegado a la barra. El camarero virtual va ENFRENTE, en
             la izquierda, a la misma altura (ver `ChatLauncher`, que lleva emparejada esta medida).
             Antes estuvieron apilados en esta misma columna: la pila caía justo sobre el precio de
             cada plato de la carta y, en el pie, sobre el aviso de copyright y "Volver arriba".
             Uno a cada lado, el centro de la línea —donde está el texto— queda libre.
             Si cambia esta altura, cambian también la de `ChatLauncher` y `FLOAT_BAND_PX`. */
          "bottom-[calc(var(--mobile-bar-h)+0.5rem+env(safe-area-inset-bottom))]",
          /* ESCRITORIO: donde estaba, a media altura del borde derecho. */
          "md:right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2",
          /* El `pointer-events` se queda AQUÍ aunque el desplazamiento se haya ido a la capa de
             dentro: esta caja sigue ocupando sus 44 px y, sin apagarla, se tragaría el toque destinado
             al contenido mientras el botón está apartado (cuando además es `inert` el navegador ya la
             saca del sondeo, pero el apartado por scroll no lo es). */
          (heroHidden || bannerOpen || footerUnder) && "max-md:pointer-events-none",
          /* `overControl` SIN `max-md:`: el disco cae sobre un control también en escritorio (en
             `/carta`, sobre el botón "Filtros"), y allí hay que apagar el puntero igual. */
          overControl && "pointer-events-none",
          scrolling && "max-md:motion-safe:pointer-events-none",
        )}
      >
        <div
          className={cn(
            /* `translate`, no `transform`: en Tailwind v4 `translate-x-6` escribe la propiedad
               `translate`, así que nombrar `transform` dejaba la aparición del botón sin transicionar. */
            FLOATING_TRANSITION,
            /* Los motivos para apartarse "de verdad" (portada, aviso de cookies, pie, control debajo)
               comparten clases y NO llevan `motion-safe:`: aquí retirarse no es adorno, es dejar libre
               algo que hay que poder pulsar, así que también ocurre con `prefers-reduced-motion`. */
            (heroHidden || bannerOpen || footerUnder) && "max-md:translate-x-6 max-md:opacity-0",
            /* `overControl` va aparte y SIN `max-md:`, porque el apartado tiene que ser también
               VISUAL en escritorio. Dejarlo solo en `inert` daba lo peor de los dos mundos: el disco
               seguía tapando la etiqueta "Filtros" con toda su opacidad y encima ya no respondía al
               clic — parecía un botón roto. Los otros tres motivos sí son de móvil: en escritorio el
               disco vive a media altura del borde y ni la portada ni el pie le estorban. */
            overControl && "translate-x-6 opacity-0",
            /* Apartado mientras el dedo desplaza: sale hacia SU borde (derecha). */
            scrolling && "max-md:motion-safe:translate-x-8 max-md:motion-safe:opacity-0",
          )}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 1.4 }}
        >
          {/* El <a> es la ZONA PULSABLE (44 px, el mínimo de WCAG que este proyecto respeta) y no
              pinta nada: el cliente pidió los botones "en un tamaño más pequeño", y lo que puede
              encoger sin bajar de 44 es la HUELLA VISUAL. El disco de dentro mide 36 px y los 4 px
              de margen que quedan alrededor siguen siendo tuyos al pulsar. En md+ los dos vuelven a
              56 px y el margen transparente desaparece: en escritorio no cambia nada. */}
          <a
            href={BUSINESS.phone.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={m.common.cta.whatsapp}
            title={m.common.cta.whatsappAria}
            onPointerEnter={notice}
            onFocus={notice}
            onClick={notice}
            className="group relative grid h-11 w-11 place-items-center rounded-full outline-none md:h-14 md:w-14"
          >
            <span
              className={cn(
                "relative grid h-9 w-9 place-items-center rounded-full md:h-14 md:w-14",
                "border border-pimenton-light/60 bg-pimenton text-cream",
                /* El hover/active los dispara el <a>, pero quien se mueve y se tiñe es el disco:
                   así el desplazamiento no arrastra consigo el margen invisible de la zona pulsable. */
                "transition-[translate,scale,background-color] duration-200 group-active:duration-100 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:bg-pimenton-light group-active:scale-95",
                /* El anillo de foco ciñe el disco, no la caja de 44: se ve dónde está el botón. */
                "group-focus-visible:ring-2 group-focus-visible:ring-pimenton-light group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-granate",
              )}
            >
              {/* Pulso neón: el resplandor es estático y lo que late es la opacidad de esta capa
                  (animar `box-shadow` repintaba el botón en cada fotograma durante toda la sesión). */}
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-neon animate-neon-pulse" />
              {/* Halo exterior suave (ping lento), solo hasta que el botón cumple su cometido */}
              {pinging && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-pimenton-light/35 [animation-duration:2.6s]"
                />
              )}
              <WhatsAppGlyph size="h-5 w-5 md:h-7 md:w-7" className="relative" />
            </span>

            {/* Tooltip (solo con puntero fino) */}
            <span
              role="tooltip"
              className={cn(
                "pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5",
                /* Sin `backdrop-blur`: el fondo ya es hierro al 95 %, no se veía nada detrás que
                   desenfocar. Y la transición se acota a las dos propiedades que de verdad cambian. */
                "border border-cream/10 bg-granate-900/95 font-caps text-[11px] tracking-[0.25em] text-cream shadow-card",
                "translate-x-1 opacity-0 transition-[translate,opacity] duration-150 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                "[@media(hover:hover)]:block",
              )}
            >
              {m.common.cta.whatsapp}
            </span>
          </a>
        </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
