"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useHeroStillVisible } from "@/components/scroll/HeroTransition";
import type { MenuItemId } from "@/data/menu";
import { localizeMenuItems } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   La foto
   ────────────────────────────────────────────────────────────── */

/**
 * Foto REAL de una tixola del local (raxo con queso de Arzúa sobre patatas panadera), vista desde
 * arriba y recortada del fondo (canal alfa). Sustituye al dibujo en CSS que vivía aquí: por muy
 * cuidado que estuviera el dibujo, el cliente no lo reconocía como una sartén, y una foto de comida de
 * verdad convence más que cualquier ilustración. Es lo primero que ve quien entra y quien valora la web.
 */
const HERO_PHOTO = { src: "/images/tixola-hero.webp", width: 641, height: 514 } as const;

/**
 * Ancho de la caja de la foto en la composición apilada (por debajo de `lg`), como expresión CSS.
 * Lo consume `PAN_BOX` (vía la variable `--pan-w`) y lo exporta para que `<Hero />` reserve encima del
 * copy una banda de exactamente esa altura (`--pan-h`): la foto y el texto se reparten la pantalla por
 * contrato, no por una fórmula que dependa de cuánto mide el copy en cada idioma.
 *  · 74vw: la sartén ocupa casi tres cuartos del ancho; con menos, en un teléfono es un adorno.
 *  · 62svh: solo muerde en horizontal (un móvil tumbado mide ~390 px de alto), donde 74vw sería
 *    más alto que la pantalla.
 *  · 300px: por encima (tablets en vertical) la foto ya es grande y el copy necesita su sitio.
 */
export const HERO_PAN_WIDTH = "min(74vw, 62svh, 300px)";
/** Alto de esa caja: la foto mide 641×514, es decir 0,8 del ancho. `<Hero />` lo usa para la banda. */
export const HERO_PAN_HEIGHT = `calc(${HERO_PAN_WIDTH} * ${(HERO_PHOTO.height / HERO_PHOTO.width).toFixed(4)})`;

/** Plato de la carta que sale en la foto: su nombre localizado alimenta el `alt` (`dishes.photoOf`). */
const HERO_DISH_ID: MenuItemId = "tix-raxo-arzua";

/**
 * Dónde cae la SARTÉN dentro del recorte de la foto, medido sobre el canal alfa (script de medición en
 * la revisión que introdujo la foto): el mango sale hacia arriba-izquierda y ocupa el tercio izquierdo
 * y la franja alta del recorte, así que el centro del disco no es el centro de la caja. Todo lo que
 * rodea a la sartén (halo, brasa, sombra, vaho, chispas) se posiciona con estas cifras, en % de la
 * caja de la foto, y las composiciones desplazan la caja para que sea el DISCO, y no el recorte, lo
 * que queda centrado en el punto elegido.
 */
const PAN = {
  /** Centro del disco, en % del ancho y del alto de la caja. */
  cx: 67.2,
  cy: 60.8,
  /** Diámetro del disco, en % del ancho de la caja. */
  diameter: 65.1,
} as const;

/* ──────────────────────────────────────────────────────────────
   Keyframes propias de la portada
   ────────────────────────────────────────────────────────────── */

/**
 * Viajan con el componente (React 19 iza el `<style href>` al `<head>` y lo deduplica por `href`) en
 * vez de vivir en `globals.css`: son exclusivas de esta portada, mientras que las del tema —`float`,
 * `ember-rise`, `neon-pulse`— las comparten varias secciones. Solo animan `transform` y `opacity`,
 * así que el compositor las lleva en GPU sin repintar.
 *
 * Con la foto en lugar del dibujo se han revisado una a una: `tixola-heat` sigue respirando en el halo
 * de calor y `tixola-steam` sigue subiendo en el vaho sobre la sartén, así que las dos se quedan. Las
 * piezas que se han ido (aro, aceite, zamburiñas, burbujas, mango) no tenían keyframes propias.
 *
 * CUIDADO con `prefers-reduced-motion`: la regla global (globals.css) NO apaga las animaciones, solo
 * les pone `animation-duration: 0.001ms` y una iteración. Sin `animation-fill-mode` eso significa que
 * terminan al instante y el elemento vuelve a SU ESTILO BASE, no al primer fotograma de la curva. Por
 * eso el vaho y las chispas llevan `opacity-0` en su clase: su reposo verdadero es "no se ve", y así
 * con movimiento reducido desaparecen en vez de quedarse como manchas pálidas y quietas sobre la
 * foto. La opacidad visible vive solo dentro de las keyframes, que es donde debe estar. La foto, en
 * cambio, tiene como reposo su posición natural: sin flotación se queda quieta y entera, que es lo
 * que se quiere.
 */
const HERO_KEYFRAMES = `
@keyframes tixola-steam {
  0%   { transform: translate3d(0, 10%, 0) scale(0.62); opacity: 0; }
  22%  { opacity: 0.42; }
  100% { transform: translate3d(0, -62%, 0) scale(1.34); opacity: 0; }
}
@keyframes tixola-heat {
  0%, 100% { opacity: 0.76; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
}
`;

/* ──────────────────────────────────────────────────────────────
   Composición
   ────────────────────────────────────────────────────────────── */

/**
 * Las dos composiciones de la portada: "split" en escritorio (la tixola en la mitad derecha, el
 * titular manda en la izquierda) y "stacked" en móvil (la tixola arriba, en su propia banda, y el copy
 * debajo).
 *
 * Se resuelven con el breakpoint `lg` de Tailwind y NO con un hook: el HTML del servidor sale ya bien
 * compuesto a cualquier ancho, sin depender de una medición que en el servidor siempre contesta
 * "escritorio".
 *
 * La caja es el RECORTE de la foto, no la sartén: el mango asoma hacia arriba-izquierda y la sartén
 * queda en la parte baja-derecha (ver `PAN`). Por eso el desplazamiento horizontal no es `-50%` sino
 * `-67.2%`: lo que se centra en el punto de anclaje es el disco. En escritorio el anclaje vertical
 * también va al centro del disco (`-60.8%`); en móvil la caja se cuelga de la cabecera y no se
 * desplaza en vertical, para que el mango nunca se meta bajo el logo.
 */
const PAN_BOX = cn(
  /* Móvil: la tixola vive ENTERA en una banda propia bajo la cabecera, y el copy empieza donde
     termina la banda (`<Hero />` reserva `--pan-h` de padding). Antes se intentaba encajar foto y copy
     en los 100svh del primer pantallazo con una fórmula (`125svh − 857.5px`) que restaba lo que mide
     el copy, y eso tenía dos problemas que la verificación cazó en teléfonos REALES: en un iPhone con
     Safari el viewport mide 664–750 px (barras de estado, URL y navegación), no los 844 de la
     emulación, y con esas alturas la fórmula daba un plato de moneda o directamente negativo (y un
     `max-height:780px` lo escondía del todo: portada roja sin sartén). Y cualquier cambio del copy
     rompía la constante en silencio.
     Ahora la banda mide lo que mide la foto (`--pan-w`, ver `HERO_PAN_WIDTH`) y, si con eso el copy no
     cabe en 100svh, la portada crece y se hace scroll: en un teléfono bajo se ven logo, sartén grande,
     kicker y titular entero, y los CTAs asoman por abajo (además la barra móvil fija ya lleva
     "Reservar"). Es la elección de una portada de revista: foto grande antes que todo en un pantallazo.
     `HeroTransition` sabe anclar una portada más alta que la pantalla (ancla por el pie).
     El disco se centra al 56 % del ancho, no al 50 %: así el mango (que sale hacia la izquierda)
     tiene su sitio sin que la punta se salga por el borde, y la sartén cae un poco a la derecha,
     contrapeso del copy alineado a la izquierda. */
  "absolute left-[56%] top-[calc(var(--header-h)+0.25rem)] w-[var(--pan-w)] -translate-x-[67.2%]",
  /* Escritorio: el disco centrado a la derecha, grande, asomando ligeramente tras el titular. El tope
     de 640 px es el ancho real de la foto: por encima el optimizador solo puede escalarla y en una
     pantalla 1x se vería blanda justo en la pieza que más se mira. El `svh` dentro del `min()` hace
     que en pantallas bajas (portátiles de 13") la foto encoja sola en vez de acercarse al titular.
     El 76 % no es el 67 % del dibujo: aquel tenía el mango hacia la derecha y el aceite oscuro, así que
     el titular podía pisarle el borde sin perder letras. La foto lleva el mango hacia el titular y un
     aro claro, y con el disco al 67 % la "o" final de la primera línea ("El Arte del Tapeo", ~890 px a
     1440) caía sobre ese aro blanco: crema sobre blanco, letra perdida. Al 76 % el disco queda libre de
     la primera línea en 1280, 1366, 1440 y 1920 (medido), y lo que asoma tras el titular es el MANGO,
     negro, sobre el que el crema se lee sin velo. Sigue sin acercarse al borde derecho (≥ 140 px). */
  "lg:left-[76%] lg:top-[52%] lg:w-[min(54vw,68svh,640px)] lg:-translate-y-[60.8%]",
);

/** Vaho sobre la sartén: tres volutas desfasadas (izquierda en %, ancho en % de la caja), sobre el disco. */
const STEAM: readonly { left: number; width: number; delay: number; duration: number }[] = [
  { left: 44, width: 24, delay: 0, duration: 7.4 },
  { left: 58, width: 30, delay: 2.6, duration: 8.8 },
  { left: 74, width: 20, delay: 5.1, duration: 6.6 },
];

/**
 * Brasas que suben del hierro. Deterministas (nada de `Math.random()`: el HTML del servidor y el del
 * cliente tienen que coincidir) y en % de la caja de la foto, no del viewport, para que acompañen a la
 * sartén en las dos composiciones. Reparten por el ancho del disco (34 %–100 % de la caja) y arrancan
 * bajo su borde inferior, que coincide con el pie de la caja.
 */
const EMBERS: readonly { left: number; bottom: number; size: number; delay: number; duration: number }[] = [
  { left: 36, bottom: 8, size: 3, delay: 0, duration: 4.2 },
  { left: 44, bottom: 14, size: 2, delay: 0.7, duration: 4.9 },
  { left: 52, bottom: 4, size: 4, delay: 1.4, duration: 3.8 },
  { left: 60, bottom: 18, size: 2, delay: 2.2, duration: 5.4 },
  { left: 68, bottom: 10, size: 3, delay: 0.4, duration: 4.4 },
  { left: 76, bottom: 2, size: 2, delay: 3.1, duration: 4.1 },
  { left: 85, bottom: 12, size: 3, delay: 1.9, duration: 5.1 },
  { left: 94, bottom: 6, size: 2, delay: 2.7, duration: 4.6 },
];

/* ──────────────────────────────────────────────────────────────
   Reposo: ¿hay alguien mirando la portada?
   ────────────────────────────────────────────────────────────── */

/**
 * ¿Hay un panel modal abierto sobre la portada? Los overlays a pantalla completa (menú móvil, modal de
 * reserva, detalle de plato, leyenda de alérgenos, visor de la galería) bloquean el `overflow` del
 * body, igual que detecta `SmoothScrollProvider` para parar Lenis. Mientras dure el bloqueo la portada
 * no se ve, y sus animaciones detrás de un panel con `backdrop-filter` obligan al navegador a volver a
 * desenfocar ese recorte en cada fotograma: el trabajo más caro de la página para algo que nadie ve.
 *
 * La señal sale ENTERA del DOM (`data-scroll-lock` en `<html>`) y de ningún contexto de React. Aquí se
 * consultaba además `useChat()`, y eso tenía dos precios que un FONDO DECORATIVO no debe pagar:
 *  · `useChat` LANZA fuera de `<ChatProvider>`, así que reutilizar esta portada en cualquier otra
 *    página (una landing de campaña, un 404 con la tixola de fondo) reventaba el árbol cliente entero
 *    y dejaba la portada en blanco. Un fondo no puede tener ese poder de derribo.
 *  · El panel del camarero mide `min(420px, 100vw-2rem)` × `min(640px, 80svh)`: en escritorio no tapa
 *    la portada ni de lejos, y sin embargo congelaba la tixola a media flotación, el vaho quieto en el
 *    aire y las chispas como puntos muertos, sin velo que lo disimulara. El ahorro que justificaba esa
 *    congelación era el `backdrop-filter` de `glass-smoke`, que solo existe con `data-gpu="high"`, es
 *    decir en el escritorio de gama alta: justo donde no hace falta ahorrar.
 * Si algún día el chat necesita parar la portada (en móvil sí la tapa), que escriba un atributo en
 * `<html>` como hacen los modales: este observador ya lo estaría mirando.
 *
 * Se lee un atributo y no `getComputedStyle(document.body).overflowY`: consultar el estilo calculado
 * fuerza un recálculo síncrono del documento entero, y esto se dispara en cada apertura y cierre de
 * modal —el momento exacto en que el usuario espera que el panel aparezca al instante—.
 * `data-scroll-lock` en `<html>` es una comparación de cadena. El `getComputedStyle` se conserva como
 * respaldo mientras algún panel no marque el atributo.
 */
function useOverlayCovering(): boolean {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const sync = () =>
      setLocked(
        document.documentElement.hasAttribute("data-scroll-lock") ||
          getComputedStyle(document.body).overflowY === "hidden",
      );
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-scroll-lock"] });
    sync();
    return () => observer.disconnect();
  }, []);

  return locked;
}

/**
 * `true` cuando la portada NO se ve y sus animaciones deben quedarse quietas: una docena de capas
 * compuestas cada fotograma cuesta batería y fotogramas en un móvil modesto, que es justo el equipo
 * que tiene que ir fino.
 *
 * TODAS las señales valen `false` (= "se ve") en el servidor y hasta que se midan, nunca al revés: si
 * la hidratación tarda o falla, la portada se queda animando, no congelada con las brasas y el vaho a
 * opacidad 0 (que es donde arrancan sus curvas).
 *
 * Dos medidas complementarias para saber si sigue a la vista, y ninguna cuesta nada por fotograma:
 *  · el almacén del pin (`HeroTransition`) sabe si el capítulo de platos ya la ha tapado;
 *  · el recorrido de scroll cubre el caso SIN pin (gama baja o `prefers-reduced-motion`), donde la
 *    portada se va con el scroll normal y nadie publica en ese almacén.
 */
function useHeroIdle(): boolean {
  const stillVisible = useHeroStillVisible();
  const overlay = useOverlayCovering();
  const [scrolledPast, setScrolledPast] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  useEffect(() => {
    const read = () => setScrolledPast(window.scrollY >= window.innerHeight);

    /* Throttle con rAF, como ya hace Navbar: el scroll puede disparar más veces que fotogramas hay, y
       todo lo que este manejador decide es un booleano que se consume al pintar. */
    let raf = 0;
    const sync = () => {
      if (raf !== 0) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        read();
      });
    };
    const onVisibility = () => setTabHidden(document.visibilityState !== "visible");

    read();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (raf !== 0) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return !stillVisible || scrolledPast || tabHidden || overlay;
}

/* ──────────────────────────────────────────────────────────────
   Portada
   ────────────────────────────────────────────────────────────── */

/**
 * Fondo de la portada: hierro fundido con la luz de las brasas y, levitando sobre ellas, la FOTO de una
 * tixola del local, con su vaho y sus chispas.
 *
 * Aquí vivió un lienzo WebGL (react-three-fiber) y, después, un dibujo de la tixola hecho enteramente
 * en CSS (aro de hierro, aceite, zamburiñas, mango). El 3D se retiró por rendimiento: obligaba a cargar
 * un megachunk de three.js, a sondear los fotogramas, a decidir en cliente si montarlo y a un error
 * boundary para las GPU bloqueadas. El dibujo se ha retirado por decisión del cliente: no se leía como
 * una sartén. La foto real sale ya en el HTML del servidor, la precarga `next/image` (es la imagen más
 * grande del primer viewport, así que muy probablemente el LCP) y cuesta lo que cuesta componer una
 * imagen con canal alfa sobre media docena de degradados.
 *
 * COSTE. Nada de filtros ni de `blur` animados: solo `transform` y `opacity`, que el compositor
 * resuelve en GPU sin repintar. La sombra bajo la sartén es un degradado radial con opacidad, no un
 * `filter: drop-shadow` (ese refiltra la silueta de la foto en cada fotograma de la flotación). Las
 * capas que respiran (el halo de calor, el vaho) están acotadas al tamaño de la caja de la foto y no
 * al viewport, porque una capa a pantalla completa animando opacidad obliga a rellenar el viewport
 * entero en cada fotograma. Y cuando la portada deja de verse, todo se para (`useHeroIdle`).
 *
 * ACCESIBILIDAD. El contenedor ya no va `aria-hidden` en bloque: la foto es contenido de verdad (un
 * plato de la casa) y lleva un `alt` descriptivo y traducido, así que lo que se oculta a las
 * tecnologías de asistencia son solo las capas decorativas (texturas, luces, vaho, chispas, velos).
 *
 * El nombre del fichero y el atributo `data-hero-canvas` del contenedor (que lo pone `<Hero />`) se
 * conservan: `HeroTransition` busca ese atributo para el alejamiento al hacer scroll y la QA visual
 * lo usa para medir que la portada está encendida.
 *
 * El último hijo es el velo que oscurece la capa durante el anclaje de la portada; lo anima
 * `HeroTransition` por su atributo `data-hero-dim`. Va aquí, y no en el hero, porque debe apagar la
 * foto sin tocar el texto, y dentro del wrapper porque así hereda su transform y su recorte.
 */
export default function HeroCanvas() {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const idle = useHeroIdle();
  /* Pausar es más barato que desmontar: no se recompone el árbol al volver y la foto sigue intacta. */
  const play: CSSProperties["animationPlayState"] = idle ? "paused" : "running";

  /* `alt` de la foto a partir de los mensajes y de los datos localizados: la plantilla `dishes.photoOf`
     ("Foto de {name} en Tixola Tapería, Ourense") es la misma que llevan las fotos de los platos
     estrella, y el nombre del plato sale de la carta ya traducida (con el español como respaldo). Se
     memoriza porque localizar la carta recorre sus ~80 platos y el idioma no cambia entre renders. */
  const alt = useMemo(() => {
    const dish = localizeMenuItems(locale).find((item) => item.id === HERO_DISH_ID);
    return t(m.dishes.photoOf, { name: dish?.name ?? m.common.brand });
  }, [locale, m, t]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-granate">
      <style href="tixola-hero-keyframes" precedence="default">
        {HERO_KEYFRAMES}
      </style>

      {/* ── Ambiente: hierro y brasas ─────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0">
        {/* Hierro de la plancha: textura real a media opacidad, que es lo que rompe el degradado plano */}
        <div className="absolute inset-0 bg-[url('/textures/iron.webp')] bg-cover bg-center opacity-55" />

        {/* Luz de la parrilla. Sigue a la sartén en cada composición (arriba, al 56 % del ancho, en
            móvil; a la derecha en escritorio) y es la que da el aire cálido de la portada. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_48%_at_56%_30%,rgba(172,32,34,0.68)_0%,rgba(112,17,18,0.34)_46%,transparent_74%)] lg:bg-[radial-gradient(ellipse_54%_62%_at_76%_52%,rgba(172,32,34,0.7)_0%,rgba(112,17,18,0.36)_44%,transparent_74%)]" />
        {/* Segundo foco, más apretado y anaranjado: el rescoldo. Sin él el glow se lee como un filtro rojo. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_34%_30%_at_56%_29%,rgba(255,122,58,0.42)_0%,rgba(215,80,40,0.16)_45%,transparent_72%)] lg:bg-[radial-gradient(ellipse_26%_34%_at_76%_50%,rgba(255,122,58,0.44)_0%,rgba(215,80,40,0.18)_45%,transparent_72%)]" />
        {/* Suelo: burdeos profundo abajo, con una línea de brasa al fondo. Ancla la escena y deja el pie
            oscuro para que el copy y el fundido con la sección siguiente tengan contraste. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_58%_at_50%_106%,rgba(255,110,52,0.26)_0%,rgba(74,15,16,0.82)_42%,rgba(59,22,19,0.35)_72%,transparent_88%)]" />
      </div>

      {/* ── La tixola ─────────────────────────────────────────────────────────────────── */}
      <div className={PAN_BOX}>
        {/* Lo que hay DEBAJO de la sartén: todo centrado en el disco (`PAN`), no en la caja. */}
        <div aria-hidden className="absolute inset-0">
          {/* Halo de calor que respira. Acotado a la caja de la foto, no al viewport. El `translate`
              de centrado vive dentro de las keyframes porque `transform` es una sola propiedad: si la
              animación lo escribiera sin él, el halo saltaría a su esquina en el primer fotograma. */}
          <div
            className="absolute aspect-square w-[135%] rounded-full bg-[radial-gradient(closest-side,rgba(255,146,80,0.34)_0%,rgba(172,32,34,0.26)_42%,transparent_76%)]"
            style={{
              left: `${PAN.cx}%`,
              top: `${PAN.cy}%`,
              animation: "tixola-heat 7.5s ease-in-out infinite",
              animationPlayState: play,
            }}
          />
          {/* Brasas bajo el hierro: la luz que sube de la parrilla y separa la sartén del fondo */}
          <div
            className="absolute aspect-[5/2] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,132,62,0.52)_0%,rgba(172,32,34,0.24)_52%,transparent_80%)]"
            style={{ left: `${PAN.cx}%`, top: `${PAN.cy + 14}%`, width: `${PAN.diameter * 1.2}%` }}
          />
          {/* Sombra proyectada, encima de esa luz y POR DEBAJO del borde del disco (el pie de la caja
              coincide con ese borde, así que la elipse cuelga fuera de ella): es lo que hace que la
              sartén LEVITE en vez de estar pegada al fondo. Un poco más estrecha que el disco, como
              la sombra de algo que está a unos centímetros de la brasa. Elipse con degradado radial y
              opacidad, nunca `filter: blur` ni `drop-shadow` (repintarían la silueta en cada
              fotograma de la flotación). */}
          <div
            className="absolute aspect-[3/1] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.45)_50%,transparent_100%)]"
            style={{ left: `${PAN.cx}%`, top: `${PAN.cy + 48}%`, width: `${PAN.diameter * 0.86}%` }}
          />
        </div>

        {/* Flotación lenta (`animate-float` del tema: translateY + 1,5° de giro). `perspective` en el
            envoltorio para que la inclinación tenga fuga. */}
        <div className="animate-float [perspective:1100px]" style={{ animationPlayState: play }}>
          {/* Inclinación muy leve: la foto está tomada a plomo y, sin nada, se leía como una pegatina
              plana sobre el fondo. Unos grados de `rotateX` (el borde alto se aleja) y un giro apenas
              perceptible bastan para que apoye en la brasa como hacía la escena 3D, sin deformar el
              plato. Va en un hijo del que flota porque `transform` es una sola propiedad. */}
          <div className="[transform:rotateX(11deg)_rotateZ(-3deg)] [transform-origin:67%_61%]">
            <Image
              src={HERO_PHOTO.src}
              width={HERO_PHOTO.width}
              height={HERO_PHOTO.height}
              alt={alt}
              /* Es la imagen más grande del primer viewport (el LCP casi seguro): se precarga y no se
                 difiere. `sizes` acompaña a los anchos de `PAN_BOX` para no bajar una versión mayor de
                 la necesaria en un teléfono. */
              priority
              sizes="(min-width: 1024px) 640px, 300px"
              draggable={false}
              className="h-auto w-full select-none"
            />
          </div>
        </div>

        {/* Lo que hay ENCIMA de la sartén */}
        <div aria-hidden className="absolute inset-0">
          {/* Vaho sobre la comida. Fuera del plano inclinado: el vapor sube recto, no por la sartén. */}
          {STEAM.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,242,224,0.34)_0%,rgba(255,236,212,0.12)_52%,transparent_78%)] opacity-0"
              style={{
                left: `${s.left}%`,
                bottom: `${100 - PAN.cy}%`,
                width: `${s.width}%`,
                aspectRatio: "3 / 4",
                animation: `tixola-steam ${s.duration}s ease-out ${s.delay}s infinite`,
                animationPlayState: play,
              }}
            />
          ))}

          {/* Chispas */}
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="animate-ember-rise absolute rounded-full bg-ember opacity-0 shadow-[0_0_9px_rgba(255,106,61,0.9)]"
              style={{
                left: `${e.left}%`,
                bottom: `${e.bottom}%`,
                width: e.size,
                height: e.size,
                animationDelay: `${e.delay}s`,
                animationDuration: `${e.duration}s`,
                animationPlayState: play,
              }}
            />
          ))}
        </div>
      </div>

      {/* Viñeta: cierra el encuadre y manda la mirada al centro caliente */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.58)_100%)]" />

      {/*
        Velo del pull-back. Reposo en 0: si nadie lo anima, la portada se ve entera.
        No es negro plano: es un radial que oscurece MUCHO más los bordes que el centro, para que el
        alejamiento se lea como una pérdida de foco (el centro conserva la tixola, el encuadre se
        cierra) y no como "se apaga la luz". Cuesta lo que un color plano: una capa que el compositor
        mezcla, sin filtro. Aquí hubo un `filter: blur(0 → 6px)` interpolado por fotograma sobre esta
        misma superficie, la más cara de toda la web; no vuelve.
      */}
      <div
        data-hero-dim
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_45%,rgba(42,15,13,0.45)_0%,rgba(42,15,13,0.78)_48%,rgba(42,15,13,1)_100%)] opacity-0"
      />
    </div>
  );
}
