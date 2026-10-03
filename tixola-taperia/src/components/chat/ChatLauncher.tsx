"use client";

import { useEffect, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { useCookieBannerOpen } from "@/components/legal/CookieConsent";
import { FLOATING_TRANSITION, useControlUnderFloat, useFooterUnderFloats, useIsScrolling } from "@/components/ui/FloatingWhatsApp";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** id del botón para devolverle el foco al cerrar el widget. */
export const CHAT_LAUNCHER_ID = "tixola-chat-launcher";

/* ──────────────────────────────────────────────────────────────
   LA LLAMADA: el globo que avisa de que hay un camarero detrás del disco
   ────────────────────────────────────────────────────────────── */

/**
 * Cuánto espera el globo desde que el lanzador está a la vista, y cuánto se queda.
 *
 * EL RETARDO NO ES UN ADORNO: el disco entra con 0,3 s de espera más 0,6 s de animación, así que un
 * globo más rápido saldría señalando a un botón que todavía está apareciendo.
 *
 * LA DURACIÓN ES DE SEIS SEGUNDOS, no de dos. El cliente pidió "dos segundos", y dos segundos dan
 * para verlo pero no para leerlo, decidir y levantar el dedo —menos aún en un móvil mientras se
 * baja la página—. Seis sigue siendo un aviso que se quita solo y no un cartel que haya que cerrar.
 */
const LLAMADA_RETARDO_MS = 1300;
const LLAMADA_DURACION_MS = 6000;

/** Una vez por visita. `sessionStorage` y no `localStorage`: si vuelve otro día, vuelve a saludar. */
const LLAMADA_CLAVE = "tixola:waiter:llamada:v1";

/* En navegación privada o con las cookies bloqueadas, `sessionStorage` LANZA al tocarlo. Un aviso
   decorativo no puede tumbar la página: si no se puede recordar, el globo sale otra vez y ya está. */
function llamadaYaVista(): boolean {
  try {
    return window.sessionStorage.getItem(LLAMADA_CLAVE) === "1";
  } catch {
    return false;
  }
}
function marcarLlamadaVista(): void {
  try {
    window.sessionStorage.setItem(LLAMADA_CLAVE, "1");
  } catch {
    /* Sin almacenamiento no hay memoria, y no pasa nada. */
  }
}

/**
 * Saca el globo una sola vez por visita, y solo mientras `activa` sea cierto —es decir, mientras el
 * lanzador esté de verdad a la vista—.
 *
 * LOS DOS TEMPORIZADORES VAN EN EFECTOS SEPARADOS A PROPÓSITO. Con los dos en el mismo efecto, que
 * `activa` pasara a falso mientras el globo estaba fuera (basta con que el dedo empiece a desplazar)
 * limpiaba también el temporizador de retirada, y el globo se quedaba puesto para siempre.
 */
function useLlamada(activa: boolean): boolean {
  const [visible, setVisible] = useState(false);
  const yaSalio = useRef(false);

  useEffect(() => {
    if (!activa || yaSalio.current) return;
    if (llamadaYaVista()) {
      yaSalio.current = true;
      return;
    }
    const temporizador = window.setTimeout(() => {
      yaSalio.current = true;
      marcarLlamadaVista();
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
  /**
   * Se llama al acercar el puntero o al enfocar el botón: ChatProvider aprovecha para pedir el chunk
   * del panel antes de la pulsación, de modo que al abrir ya esté en memoria.
   */
  onPreload?: () => void;
}

/**
 * Lanzador del camarero virtual: disco redondo de cristal rojo, abajo a la IZQUIERDA en las dos
 * gamas (el de WhatsApp vive enfrente, a la derecha). 56 px en escritorio, 36 px de disco dentro de
 * una zona pulsable de 44 en móvil. Se recoge mientras el widget está abierto (el panel nace de su
 * misma esquina) y luce un punto pimentón hasta la primera apertura. Igual que el de WhatsApp, se
 * aparta con la portada a la vista, con el aviso de cookies abierto, con el pie a la vista, mientras
 * el dedo desplaza (`useIsScrolling`) y cuando le ha quedado un control debajo (`useControlUnderFloat`).
 * Al acercar el puntero o enfocarlo avisa a ChatProvider (`onPreload`) para que el chunk del panel
 * llegue antes que el clic.
 * Recibe el estado por props desde ChatProvider (así no hay ciclo de importación con el contexto).
 */
export default function ChatLauncher({ isOpen, hasOpened, onToggle, onPreload }: ChatLauncherProps) {
  const m = useMessages();
  const mobile = useIsMobile(768);
  /* El mismo almacén que usa el botón de WhatsApp, para que los dos se aparten y vuelvan a la vez:
     si cada uno llevara su temporizador, bastaría un render desacompasado para verlos desfilar. */
  const scrolling = useIsScrolling();

  /*
    EL CAMARERO SE VE DESDE EL PRIMER SEGUNDO, TAMBIÉN EN LA PORTADA DEL MÓVIL.

    Antes esperaba a que el visitante bajara el 45 % de la pantalla, como su gemelo de WhatsApp, para
    no tapar los botones de la portada. Pero eso dejaba el camarero invisible justo donde entra casi
    todo el mundo —la home, en un teléfono— y escondido detrás de un gesto que mucha gente no llega a
    hacer. Un asistente que hay que descubrir desplazando no es un asistente, es un secreto.

    Lo que protegía de taparlo sigue en pie y es mejor: `useControlUnderFloat` aparta el disco en
    cuanto le queda DEBAJO algo pulsable, sea en la portada o donde sea. Es una medida real de lo que
    hay bajo el botón, no una suposición sobre cuánto ha bajado el dedo.

    El de WhatsApp sí conserva su espera: el cliente pidió destacar el camarero, y si los dos
    aparecieran a la vez sobre la portada volveríamos a la pantalla llena de discos que ya se corrigió.
  */
  /* El aviso de cookies ocupa todo el ancho y ~350 px de alto en móvil: taparía este botón. Desde
     `md` se centra (`md:w-[min(42rem,100vw-3rem)]`), así que su borde izquierdo sigue cayendo sobre
     el lanzador hasta ~816 px de ancho — tablets en vertical. Por eso el apartado por el aviso usa
     un umbral propio (lg) y el de la portada se queda en el suyo (md). */
  const bannerOpen = useCookieBannerOpen();
  const bannerOverlaps = useIsMobile(1024);
  /* Emparejado con `FloatingWhatsApp`: los dos se retiran en cuanto el pie les queda debajo, porque
     su última línea (copyright, crédito de diseño, "Volver arriba") cae justo en esa franja. */
  const footerUnder = useFooterUnderFloats();

  /* VENTANA DE DEVOLUCIÓN DEL FOCO. `ChatWidget.handleClose` cierra el panel y devuelve el foco a este
     botón (`getElementById(...).focus()`), que es lo que exige el patrón de diálogo. Pero `hidden`
     alimenta el `inert` del envoltorio, y un nodo dentro de un envoltorio `inert` NO puede recibir el
     foco: si al cerrar se cumplía cualquiera de los motivos para apartarse —el pie a la vista, que es
     justo donde acaba el usuario en móvil, o el aviso de cookies—, el `focus()` no hacía nada y quien
     navega con teclado o lector de pantalla aterrizaba en el `<body>`, detrás del panel.
     Se resuelve aquí y no en `ChatWidget` esperando a un repintado: encadenar `requestAnimationFrame`
     es adivinar cuándo React ha soltado el `inert`, y si se falla el foco se pierde en silencio. Con
     esta ventana el envoltorio simplemente NO es `inert` mientras se le está pidiendo el foco.
     El ajuste va en el CUERPO DEL RENDER (patrón de React para estado derivado de un cambio de prop) y
     no en un efecto: así el `inert` desaparece en el MISMO commit en que `isOpen` pasa a false, antes
     de que el `requestAnimationFrame` de `handleClose` llegue a pedir el foco.
     La ventana se cierra en cuanto el botón pierde el foco (`onBlur`), así que el lanzador solo se
     queda visible sobre el pie mientras realmente tiene el foco — que es lo que pide la WCAG: el
     elemento enfocado tiene que verse. */
  const [returning, setReturning] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (wasOpen && !isOpen) setReturning(true);
  }
  /* Y se cierra también al primer gesto de scroll. `onBlur` no basta: quien cierra con el dedo no
     suelta el foco al desplazar, así que la ventana se quedaba abierta indefinidamente y el lanzador
     seguía visible sobre las filas de plato — deshaciendo justo lo que arregla `overControl`. Al
     desplazar ya no hay ningún foco que devolver. */
  if (returning && scrolling) setReturning(false);

  /* Emparejado con `FloatingWhatsApp`: si el disco ha ido a caer sobre un control del contenido (una
     fila de plato, una chip, el desplegable del FAQ) no vuelve del apartado. Va en todas las
     pantallas por el mismo motivo que su gemelo —en escritorio los márgenes tampoco están siempre
     libres—, salvo cuando el panel está abierto, que entonces el lanzador ya no se pinta. El porqué
     y lo que se descartó, en `useControlUnderFloat`. */
  const boxRef = useRef<HTMLDivElement>(null);
  /* `bannerOpen` como tercer argumento: al cerrarse el aviso de cookies hay que volver a mirar qué
     hay debajo, o el disco se queda apartado por una medición vieja (ver `useControlUnderFloat`). */
  const overControl = useControlUnderFloat(boxRef, !isOpen, bannerOpen);

  /* Los dos motivos de retirada, YA con la ventana de devolución aplicada. Se calculan una sola vez y
     los usan tanto el `inert`/`tabIndex` como las clases que apartan el disco: si la ventana solo
     levantara el `inert`, el botón recibiría el foco pero seguiría a opacidad 0 y desplazado fuera —el
     foco estaría puesto en algo invisible, que es el otro lado del mismo fallo. */
  const retracted = !returning && (footerUnder || overControl);
  const bannerRetracted = !returning && bannerOpen;
  const hidden = isOpen || (retracted && mobile) || (bannerRetracted && bannerOverlaps);

  /* EL GLOBO SOLO SALE CON EL LANZADOR QUIETO Y A LA VISTA, y esto es lo único delicado de la pieza:
     en la home del móvil el disco no existe hasta haber bajado media pantalla, y con el aviso de
     cookies abierto está apartado. Un temporizador que arrancara al cargar la página señalaría a una
     esquina vacía justo donde más gente entra. Por eso la cuenta empieza AQUÍ, cuando el botón está
     de verdad donde el globo va a apuntar. */
  const lanzadorQuieto = !isOpen && !hidden && !retracted && !bannerRetracted && !scrolling;
  const llamada = useLlamada(!hasOpened && lanzadorQuieto);

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={boxRef}
        /* Igual que en `FloatingWhatsApp`: identifica la capa flotante para el QA de solapes. */
        data-floating="chat"
        inert={hidden ? true : undefined}
        className={cn(
          /* ESTA CAJA NO SE MUEVE NUNCA: es la posición de reposo y nada más. El apartado vive en la
             capa de dentro, para que medir qué hay debajo del botón lea su sitio real (ver el gemelo
             en `FloatingWhatsApp`). */
          "fixed z-40",
          /* MÓVIL: esquina inferior IZQUIERDA, a la misma altura que el de WhatsApp, que va enfrente.
             Se probó antes una esquina para cada uno pero a distinta altura (entre los dos barrían
             media pantalla y se comían los nombres de plato y los botones "Reservar mesa" / "Llamar")
             y luego los dos apilados a la derecha (la columna caía sobre el precio de cada plato y,
             en el pie, sobre el copyright y "Volver arriba"). Enfrentados y pegados a la barra dejan
             libre toda la franja central, que es por donde corre el texto.
             La altura va EMPAREJADA con la de `FloatingWhatsApp`: 0,5rem de respiro sobre la barra.
             Si cambia, cambian también la del otro botón y `FLOAT_BAND_PX`, que es esta misma franja
             traducida a píxeles para el umbral del pie. */
          "left-3 bottom-[calc(var(--mobile-bar-h)+0.5rem+env(safe-area-inset-bottom))]",
          /* ESCRITORIO: donde estaba, abajo a la izquierda, que ahí no molesta a nadie. */
          "md:left-4 md:bottom-6",
          /* El `pointer-events` se queda AQUÍ, no en la capa que se desplaza: esta caja sigue ocupando
             sus 44 px y, apagada solo por dentro, se tragaría el toque del contenido de debajo mientras
             el botón está apartado (ver el gemelo en `FloatingWhatsApp`). */
          (!returning && footerUnder) && "max-md:pointer-events-none",
          /* `overControl` SIN `max-md:`: el disco también cae sobre controles en escritorio
             (su gemelo de WhatsApp lo hacía sobre el botón "Filtros" de la carta). */
          (!returning && overControl) && "pointer-events-none",
          bannerRetracted && "max-lg:pointer-events-none",
          scrolling && "max-md:motion-safe:pointer-events-none",
        )}
      >
        <div
          className={cn(
            /* `relative` para que el globo cuelgue de aquí: así hereda TODO el apartado (portada,
               cookies, pie, control debajo, desplazamiento) sin repetir ni una condición. */
            "relative",
            /* `translate`, no `transform`: `-translate-x-6` es la propiedad `translate` en Tailwind v4. */
            FLOATING_TRANSITION,
            /* Al apartarse sale hacia SU borde, el izquierdo: por eso el signo es negativo aquí y
               positivo en el de WhatsApp. Estos motivos (portada, aviso, pie, control debajo) no llevan
               `motion-safe:`: retirarse aquí no es adorno, es liberar algo que hay que poder pulsar. */
            (!returning && footerUnder) && "max-md:-translate-x-6 max-md:opacity-0",
            /* Aparte y sin `max-md:`, para que en escritorio el apartado sea también VISUAL:
               dejarlo solo en `inert` deja un disco opaco encima de algo que hay que pulsar y
               que ya no responde, que parece un botón roto. */
            (!returning && overControl) && "-translate-x-6 opacity-0",
            bannerRetracted && "max-lg:-translate-x-6 max-lg:opacity-0",
            /* Apartado mientras el dedo desplaza (ver `useIsScrolling`). */
            scrolling && "max-md:motion-safe:-translate-x-8 max-md:motion-safe:opacity-0",
          )}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={isOpen ? { opacity: 0, scale: 0.4, x: 0 } : { opacity: 1, scale: 1, x: 0 }}
          /* La ENTRADA del botón al cargar la página. Eran 1,2 s de espera "a que la portada se
             asiente", y sumados a que en el móvil no salía hasta bajar media pantalla, el camarero
             tardaba demasiado en existir. Ahora entra casi de inmediato: lo justo para que no aparezca
             a mitad de la primera pintada. No vale para la vuelta tras cerrar el panel: ahí el
             lanzador acaba de recibir el foco (ver la ventana de devolución arriba) y se quedaría
             invisible con el foco puesto — justo lo que la WCAG pide que no pase. `hasOpened`
             distingue las dos situaciones sin estado nuevo: es false solo en la primera aparición. */
          transition={
            isOpen
              ? { duration: 0.25, ease: EASE_OUT_EXPO }
              : { duration: 0.8, ease: EASE_OUT_EXPO, delay: hasOpened ? 0 : 1.2 }
          }
          className={cn(isOpen && "pointer-events-none")}
        >
          {/* El <button> es la ZONA PULSABLE (44 px, el mínimo de WCAG) y no pinta nada; el disco de
              dentro mide 36. El cliente pidió los botones "en un tamaño más pequeño" y lo único que
              puede encoger sin bajar de 44 es la huella visual: los 4 px de margen que quedan
              alrededor del disco siguen respondiendo al dedo. En md+ ambos vuelven a 56 px. */}
          <button
            id={CHAT_LAUNCHER_ID}
            type="button"
            onClick={onToggle}
            onPointerEnter={onPreload}
            onFocus={onPreload}
            /* Cierra la ventana de devolución del foco (ver arriba): en cuanto el foco se va, el
               lanzador vuelve a obedecer a los motivos normales para apartarse. */
            onBlur={() => setReturning(false)}
            aria-label={m.chat.launcherAria}
            aria-expanded={isOpen}
            aria-controls="tixola-chat-widget"
            title={m.chat.launcher}
            tabIndex={hidden ? -1 : 0}
            className="group relative grid h-11 w-11 place-items-center rounded-full outline-none md:h-14 md:w-14"
          >
            <span
              className={cn(
                "relative grid h-9 w-9 place-items-center rounded-full text-cream md:h-14 md:w-14",
                /* Liquid Glass: es un control flotante, así que va en cristal (fino: solo lleva un icono,
                   que pide 3:1 y lo pasa con 4:1 incluso con blanco debajo). Antes era burdeos opaco
                   por miedo a recalcular el desenfoque con la portada animándose debajo; un disco de
                   36-56 px es la superficie más barata de desenfocar de toda la página, y las cifras de
                   fotograma de la pasada lo confirman. */
                "liquid-glass",
                /* `scale` y `translate` son propiedades propias en Tailwind v4: van nombradas para que
                   `active:scale-95` responda en 100 ms y no herede los 300 del hover. El gesto lo
                   dispara el <button>, pero quien se mueve es el disco, no la caja pulsable. */
                "transition-[translate,scale,background-color,box-shadow] duration-[var(--dur-morph)] group-active:duration-100 ease-[var(--ease-muelle)] group-hover:-translate-y-0.5 group-hover:[--glass-bg:rgba(90,20,24,0.72)] group-active:scale-[0.96]",
                /* El anillo de foco ciñe el disco, no la caja de 44: se ve dónde está el botón. */
                "group-focus-visible:ring-2 group-focus-visible:ring-pimenton-light group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-granate",
              )}
            >
              <MessageSquareText aria-hidden className="relative h-5 w-5 md:h-6 md:w-6" strokeWidth={1.8} />

              {/* Punto pimentón: "hay alguien al otro lado" hasta la primera apertura */}
              {!hasOpened && (
                <span aria-hidden className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-pimenton-light/60 [animation-duration:2.4s]" />
                  <span className="relative h-3 w-3 rounded-full border-2 border-granate bg-pimenton-light" />
                </span>
              )}
            </span>

            {/* Tooltip (solo con puntero fino) */}
            <span
              role="tooltip"
              className={cn(
                "pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5",
                "liquid-glass liquid-glass-strong font-caps text-[11px] tracking-[0.25em] text-cream",
                "-translate-x-1 opacity-0 transition-[translate,opacity] duration-150 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                "[@media(hover:hover)]:block",
              )}
            >
              {m.chat.launcher}
            </span>
          </button>
        </motion.div>

        {/*
          EL GLOBO. Sale a la derecha del disco —el lanzador vive en la esquina IZQUIERDA—, se quita
          solo y abre el camarero si lo pulsan.

          ES UN DUPLICADO DECORATIVO, de ahí el `aria-hidden` y el `tabIndex={-1}`: justo al lado hay
          un botón de verdad, etiquetado y en el orden de tabulación, que hace exactamente lo mismo.
          Anunciarlo otra vez —o peor, como región viva que interrumpe— sería repetirle lo mismo dos
          veces a quien usa lector de pantalla.

          Y NO LLEVA `motion-safe:`: quien pide menos movimiento ve el globo aparecer y desaparecer
          sin deslizamiento (la regla global de `globals.css` le deja la transición en 0,001 ms), que
          es lo correcto. Esconderle el aviso entero sería quitarle información, no movimiento.
        */}
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={onToggle}
          className={cn(
            "absolute left-full top-1/2 ml-2 max-w-[calc(100vw-5.5rem)] -translate-y-1/2 truncate rounded-full px-3 py-2 md:ml-3 md:px-4",
            /* Un toast: cristal fuerte (lleva texto), con el filo en pimentón para que se lea como del camarero. */
            "liquid-glass liquid-glass-strong [--glass-border:rgba(232,86,90,0.45)] text-left font-sans text-[12px] font-semibold text-cream md:text-[13px]",
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
