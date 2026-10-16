"use client";

import { useEffect, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { useCookieBannerOpen } from "@/components/consent/CookieConsent";
import { FLOATING_TRANSITION, useControlUnderFloat, useFooterUnderFloats, useIsScrolling } from "@/components/ui/FloatingWhatsApp";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** id del botón para devolverle el foco al cerrar el panel. */
export const CHAT_LAUNCHER_ID = "as-chat-launcher";
/** id del panel (lo enlaza `aria-controls`). */
export const CHAT_WIDGET_ID = "as-chat-widget";

/* ──────────────────────────────────────────────────────────────
   LA LLAMADA: el globo que avisa de que hay alguien detrás del disco
   ────────────────────────────────────────────────────────────── */

/**
 * Cuánto espera el globo desde que el lanzador está a la vista, y cuánto se queda. El retardo no es
 * adorno: el disco entra con su propia animación y un globo más rápido señalaría a un botón que
 * todavía está apareciendo. Seis segundos dan para leerlo y decidir; sigue siendo un aviso que se
 * quita solo, no un cartel que haya que cerrar.
 */
const LLAMADA_RETARDO_MS = 1600;
const LLAMADA_DURACION_MS = 6000;

/**
 * «Ya le he sacado el globo a esta persona», EN UNA VARIABLE DEL MÓDULO y no en `sessionStorage`
 * (lección de tixola). El art. 22.2 LSSI exige consentimiento para guardar datos en el equipo de quien
 * visita salvo lo estrictamente necesario para un servicio QUE LA PERSONA HAYA PEDIDO, y un globo de
 * saludo no lo es. La variable de módulo sobrevive a la navegación interna, así que el globo sale una
 * sola vez por visita; con una recarga completa vuelve a salir.
 */
let llamadaHecha = false;

/**
 * Saca el globo una sola vez por visita, y solo mientras `activa` sea cierto (el lanzador quieto y a
 * la vista). Los dos temporizadores van en efectos separados: si `activa` pasa a falso con el globo
 * fuera, no debe cancelarse también su retirada, o se quedaría puesto para siempre.
 */
function useLlamada(activa: boolean): boolean {
  const [visible, setVisible] = useState(false);
  const yaSalio = useRef(false);

  useEffect(() => {
    if (!activa || yaSalio.current) return;
    if (llamadaHecha) {
      yaSalio.current = true;
      return;
    }
    const temporizador = window.setTimeout(() => {
      yaSalio.current = true;
      llamadaHecha = true;
      setVisible(true);
    }, LLAMADA_RETARDO_MS);
    return () => window.clearTimeout(temporizador);
  }, [activa]);

  useEffect(() => {
    if (!visible) return;
    const temporizador = window.setTimeout(() => setVisible(false), LLAMADA_DURACION_MS);
    return () => window.clearTimeout(temporizador);
  }, [visible]);

  return visible;
}

export interface ChatLauncherProps {
  isOpen: boolean;
  /** true desde la primera apertura: retira el punto de aviso */
  hasOpened: boolean;
  onToggle: () => void;
  /** Al acercar el puntero o enfocar el botón: ChatProvider pide ya el chunk del panel. */
  onPreload?: () => void;
}

/**
 * Lanzador del asistente: disco de cristal claro con el icono en carmín, abajo a la IZQUIERDA.
 *
 * DÓNDE VA Y POR QUÉ. El botón de WhatsApp vive abajo a la DERECHA en el móvil y centrado en el borde
 * derecho en escritorio, y la barra de Reservar/Llamar ocupa el pie del móvil. Así que el asistente va
 * enfrente: en el móvil, a la misma altura que el de WhatsApp (0,5 rem sobre la barra), y en
 * escritorio, en la esquina inferior izquierda, que no usa nadie. Enfrentados dejan libre la franja
 * central, por donde corre el texto. Y el disco va en cristal CLARO, no carmín: el carmín macizo es
 * la acción de la casa (WhatsApp, Reservar) y dos discos carmín se leerían como dos versiones de lo
 * mismo.
 *
 * Igual que el de WhatsApp —con los MISMOS almacenes, para que se aparten y vuelvan a la vez—, se
 * retira con el pie a la vista, mientras el dedo desplaza y cuando le ha quedado un control debajo.
 * A diferencia de él, se retira con el aviso de cookies abierto EN TODOS LOS ANCHOS: el aviso es
 * ancho completo en el móvil y en escritorio grande se pega abajo a la izquierda, justo aquí.
 */
export default function ChatLauncher({ isOpen, hasOpened, onToggle, onPreload }: ChatLauncherProps) {
  const m = useMessages();
  const mobile = useIsMobile(768);
  const scrolling = useIsScrolling();
  const bannerOpen = useCookieBannerOpen();
  const footerUnder = useFooterUnderFloats();

  /* VENTANA DE DEVOLUCIÓN DEL FOCO (de tixola). Al cerrar, el panel devuelve el foco a este botón,
     que es lo que pide el patrón de diálogo. Pero `hidden` alimenta el `inert` del envoltorio, y un
     nodo `inert` NO recibe el foco: si al cerrar el pie estaba a la vista, el foco se perdía en el
     <body>. Mientras se le está devolviendo el foco, el envoltorio no es `inert`.
     El ajuste va en el CUERPO DEL RENDER (patrón de React para estado derivado de un cambio de prop)
     y no en un efecto: así el `inert` desaparece en el mismo commit en que `isOpen` pasa a false,
     antes de que el `requestAnimationFrame` del panel pida el foco. Se cierra al perder el foco o al
     primer gesto de scroll. */
  const [returning, setReturning] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (wasOpen && !isOpen) setReturning(true);
  }
  if (returning && scrolling) setReturning(false);

  /* Si el disco ha caído sobre un control del contenido (un botón «Reservar» de una tarjeta, el
     desplegable del FAQ) no vuelve del apartado. `bannerOpen` como tercer argumento: al cerrarse el
     aviso de cookies hay que volver a mirar qué hay debajo. */
  const boxRef = useRef<HTMLDivElement>(null);
  const overControl = useControlUnderFloat(boxRef, !isOpen, bannerOpen);

  /* Los motivos de retirada, YA con la ventana de devolución aplicada. Los usan a la vez el `inert`
     y las clases que apartan el disco: si solo se levantara el `inert`, el foco caería en un botón
     invisible. */
  const retracted = !returning && (footerUnder || overControl);
  const bannerRetracted = !returning && bannerOpen;
  /* El pie solo aparta en el móvil (sus clases van con `max-md:`); el control debajo y el aviso de
     cookies, en todos los anchos. */
  const hidden = isOpen || (!returning && ((footerUnder && mobile) || overControl)) || bannerRetracted;

  /* El globo solo sale con el lanzador QUIETO y a la vista: un temporizador que arrancara al cargar
     señalaría a una esquina vacía con el aviso de cookies abierto. */
  const lanzadorQuieto = !isOpen && !hidden && !retracted && !scrolling;
  const llamada = useLlamada(!hasOpened && lanzadorQuieto);

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={boxRef}
        /* Identifica la capa flotante: `useControlUnderFloat` ignora lo que lleva esta marca, así que
           WhatsApp no se aparta por culpa de este disco ni este por culpa de aquel. */
        data-floating="chat"
        inert={hidden ? true : undefined}
        className={cn(
          /* ESTA CAJA NO SE MUEVE NUNCA: es la posición de reposo. El apartado vive en la capa de
             dentro, para que medir qué hay debajo del botón lea su sitio real. */
          "fixed z-40",
          /* MÓVIL: esquina inferior izquierda, a la MISMA altura que el de WhatsApp (que va enfrente):
             0,5 rem sobre la barra. Si cambia, cambia también allí (y su `FLOAT_BAND_PX`). */
          "left-3 bottom-[calc(var(--mobile-bar-h)+0.5rem+env(safe-area-inset-bottom))]",
          /* ESCRITORIO: abajo a la izquierda (WhatsApp está centrado en el borde derecho). */
          "md:left-4 md:bottom-6",
          /* El `pointer-events` va AQUÍ y no en la capa que se desplaza: esta caja sigue ocupando sus
             44 px y, apagada solo por dentro, se tragaría el toque del contenido de debajo. */
          !returning && footerUnder && "max-md:pointer-events-none",
          !returning && overControl && "pointer-events-none",
          bannerRetracted && "pointer-events-none",
          scrolling && "max-md:motion-safe:pointer-events-none",
        )}
      >
        <div
          className={cn(
            /* `relative` para que el globo cuelgue de aquí y herede todo el apartado. */
            "relative",
            FLOATING_TRANSITION,
            /* Sale hacia SU borde, el izquierdo (signo negativo; el de WhatsApp, positivo). Estos motivos
               no llevan `motion-safe:`: retirarse aquí no es adorno, es dejar libre algo que hay que
               poder pulsar. */
            !returning && footerUnder && "max-md:-translate-x-6 max-md:opacity-0",
            !returning && overControl && "-translate-x-6 opacity-0",
            bannerRetracted && "-translate-x-6 opacity-0",
            scrolling && "max-md:motion-safe:-translate-x-8 max-md:motion-safe:opacity-0",
          )}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={isOpen ? { opacity: 0, scale: 0.4 } : { opacity: 1, scale: 1 }}
            /* La primera entrada espera un poco a que la página se asiente; la vuelta tras cerrar el
               panel no espera nada, porque el botón acaba de recibir el foco y tiene que verse ya. */
            transition={isOpen ? { duration: 0.25, ease: EASE_OUT_EXPO } : { duration: 0.8, ease: EASE_OUT_EXPO, delay: hasOpened ? 0 : 0.9 }}
            className={cn(isOpen && "pointer-events-none")}
          >
            {/* El <button> es la ZONA PULSABLE (44 px, el mínimo de WCAG) y no pinta nada; el disco de
                dentro mide 36 en el móvil, como el de WhatsApp. En md+ ambos van a 56. */}
            <button
              id={CHAT_LAUNCHER_ID}
              type="button"
              onClick={onToggle}
              onPointerEnter={onPreload}
              onFocus={onPreload}
              onBlur={() => setReturning(false)}
              aria-label={m.chat.launcherAria}
              aria-expanded={isOpen}
              aria-controls={CHAT_WIDGET_ID}
              title={m.chat.launcher}
              tabIndex={hidden ? -1 : 0}
              className="group relative grid h-11 w-11 place-items-center rounded-full outline-none md:h-14 md:w-14"
            >
              <span
                className={cn(
                  "relative grid h-9 w-9 place-items-center rounded-full text-carmin md:h-14 md:w-14",
                  /* Cristal fino: solo lleva un icono, que pide 3:1 y el carmín lo pasa de largo. */
                  "liquid-glass",
                  "transition-[translate,scale,background-color] duration-[var(--dur-morph)] group-active:duration-100 ease-[var(--ease-muelle)] group-hover:-translate-y-0.5 group-hover:[--glass-bg:rgba(255,255,255,0.92)] group-active:scale-[0.96]",
                  /* El anillo de foco ciñe el disco, no la caja de 44: se ve dónde está el botón. */
                  "group-focus-visible:ring-2 group-focus-visible:ring-carmin group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-crema",
                )}
              >
                <MessageSquareText aria-hidden className="relative h-5 w-5 md:h-6 md:w-6" strokeWidth={1.8} />

                {/* Punto carmín: «hay alguien al otro lado» hasta la primera apertura. El latido lo
                    para la regla global de movimiento reducido de globals.css. */}
                {!hasOpened && (
                  <span aria-hidden className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-carmin-suave/45 [animation-duration:2.4s]" />
                    <span className="relative h-3 w-3 rounded-full border-2 border-white bg-carmin-suave" />
                  </span>
                )}
              </span>

              {/* Tooltip (solo con puntero fino): cristal fuerte porque lleva texto. */}
              <span
                role="tooltip"
                className={cn(
                  "pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5",
                  "liquid-glass liquid-glass-strong font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-tinta",
                  "-translate-x-1 opacity-0 transition-[translate,opacity] duration-150 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                  "[@media(hover:hover)]:block",
                )}
              >
                {m.chat.launcher}
              </span>
            </button>
          </motion.div>

          {/*
            EL GLOBO. Sale a la derecha del disco, se quita solo y abre el asistente si lo pulsan.
            Es un DUPLICADO DECORATIVO (`aria-hidden`, `tabIndex={-1}`): justo al lado hay un botón de
            verdad, etiquetado y en el orden de tabulación, que hace lo mismo.
            ANCHO MÁXIMO: en el móvil no puede llegar al disco de WhatsApp, que vive en la otra esquina
            a la misma altura: 3,25 rem de margen izquierdo + 0,5 de hueco a este lado, y 3,5 rem de
            disco + 0,75 de margen al otro. De ahí el `100vw − 8,5rem`.
          */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={onToggle}
            className={cn(
              "absolute left-full top-1/2 ml-2 max-w-[calc(100vw-8.5rem)] -translate-y-1/2 truncate rounded-full px-3 py-2 md:ml-3 md:max-w-none md:px-4",
              "liquid-glass liquid-glass-strong [--glass-border:rgba(125,95,82,0.4)] text-left font-sans text-[12px] font-semibold text-tinta md:text-[13px]",
              "transition-[translate,opacity] duration-500 ease-[var(--ease-out-expo)]",
              llamada ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-2 opacity-0",
            )}
          >
            {m.chat.cue}
          </button>
        </div>
      </div>
    </MotionConfig>
  );
}
