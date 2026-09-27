"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useHeroStillVisible } from "@/components/scroll/HeroTransition";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Keyframes propias de la portada
   ────────────────────────────────────────────────────────────── */

/**
 * Viajan con el componente (React 19 iza el `<style href>` al `<head>` y lo deduplica por `href`) en
 * vez de vivir en `globals.css`: son exclusivas de este dibujo, mientras que las del tema —`float`,
 * `ember-rise`, `neon-pulse`— las comparten varias secciones. Solo animan `transform` y `opacity`,
 * así que el compositor las lleva en GPU sin repintar.
 *
 * CUIDADO con `prefers-reduced-motion`: la regla global (globals.css) NO apaga las animaciones, solo
 * les pone `animation-duration: 0.001ms` y una iteración. Sin `animation-fill-mode` eso significa que
 * terminan al instante y el elemento vuelve a SU ESTILO BASE, no al primer fotograma de la curva. Por
 * eso el vaho y las chispas llevan `opacity-0` en su clase: su reposo verdadero es "no se ve", y así
 * con movimiento reducido desaparecen en vez de quedarse como manchas pálidas y quietas sobre el
 * aceite. La opacidad visible vive solo dentro de las keyframes, que es donde debe estar.
 */
const HERO_KEYFRAMES = `
@keyframes tixola-steam {
  0%   { transform: translate3d(0, 10%, 0) scale(0.62); opacity: 0; }
  22%  { opacity: 0.42; }
  100% { transform: translate3d(0, -62%, 0) scale(1.34); opacity: 0; }
}
@keyframes tixola-heat {
  0%, 100% { opacity: 0.76; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.05); }
}
`;

/* ──────────────────────────────────────────────────────────────
   Composición y piezas del dibujo
   ────────────────────────────────────────────────────────────── */

/**
 * Las dos composiciones de la portada: "split" en escritorio (la tixola en la mitad derecha, el
 * titular manda en la izquierda) y "stacked" en móvil (la tixola arriba, el copy libre abajo).
 *
 * Se resuelven con el breakpoint `lg` de Tailwind y NO con un hook: el HTML del servidor sale ya bien
 * compuesto a cualquier ancho, sin depender de una medición que en el servidor siempre contesta
 * "escritorio". El ancho lleva `svh` dentro del `min()` para que en pantallas bajas (móvil en
 * horizontal, portátiles de 13") la tixola encoja sola en vez de acercarse al titular: su altura
 * visible es ~0,53 del ancho por la inclinación, así que acotar el ancho acota el alto.
 */
const PAN_BOX = cn(
  "absolute left-[46%] top-[32%] w-[min(68vw,40svh,320px)] -translate-x-1/2 -translate-y-1/2",
  "lg:left-[67%] lg:top-[52%] lg:w-[min(38vw,46svh,430px)]",
);

/** Zamburiñas: posición, tamaño y giro en % de la caja de la tixola (dentro del plano ya inclinado). */
const SCALLOPS: readonly { left: number; top: number; size: number; tilt: number }[] = [
  { left: 32, top: 29, size: 15, tilt: -16 },
  { left: 52, top: 34, size: 14, tilt: 24 },
  { left: 40, top: 51, size: 16, tilt: 5 },
];

/**
 * Burbujas del aceite hirviendo (`ring`) y pimentón espolvoreado (`fleck`), en % de la caja. Son el
 * detalle que separa un dibujo de un plato: sin ellas el aceite se lee como una superficie pintada.
 */
const GARNISH: readonly { left: number; top: number; size: number; kind: "ring" | "fleck" }[] = [
  { left: 28, top: 44, size: 3.4, kind: "ring" },
  { left: 62, top: 50, size: 2.6, kind: "ring" },
  { left: 57, top: 27, size: 2.2, kind: "ring" },
  { left: 36, top: 64, size: 1.6, kind: "fleck" },
  { left: 66, top: 40, size: 1.4, kind: "fleck" },
  { left: 45, top: 24, size: 1.3, kind: "fleck" },
  { left: 25, top: 56, size: 1.5, kind: "fleck" },
];

/** Vaho sobre el aceite: tres volutas desfasadas (izquierda en %, ancho en % de la caja). */
const STEAM: readonly { left: number; width: number; delay: number; duration: number }[] = [
  { left: 24, width: 32, delay: 0, duration: 7.4 },
  { left: 42, width: 40, delay: 2.6, duration: 8.8 },
  { left: 62, width: 28, delay: 5.1, duration: 6.6 },
];

/**
 * Brasas que suben del hierro. Deterministas (nada de `Math.random()`: el HTML del servidor y el del
 * cliente tienen que coincidir) y en % de la caja de la tixola, no del viewport, para que acompañen a
 * la sartén en las dos composiciones.
 */
const EMBERS: readonly { left: number; bottom: number; size: number; delay: number; duration: number }[] = [
  { left: 16, bottom: 44, size: 3, delay: 0, duration: 4.2 },
  { left: 28, bottom: 52, size: 2, delay: 0.7, duration: 4.9 },
  { left: 38, bottom: 40, size: 4, delay: 1.4, duration: 3.8 },
  { left: 47, bottom: 56, size: 2, delay: 2.2, duration: 5.4 },
  { left: 56, bottom: 46, size: 3, delay: 0.4, duration: 4.4 },
  { left: 64, bottom: 38, size: 2, delay: 3.1, duration: 4.1 },
  { left: 72, bottom: 50, size: 3, delay: 1.9, duration: 5.1 },
  { left: 84, bottom: 42, size: 2, delay: 2.7, duration: 4.6 },
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
 * Fondo de la portada, dibujado ENTERAMENTE en CSS: hierro fundido con la luz de las brasas, aceite
 * caliente, tres zamburiñas, el mango con su anilla, vaho y chispas subiendo.
 *
 * Aquí vivía un lienzo WebGL (react-three-fiber) con este mismo dibujo como plan B. Se ha retirado por
 * decisión de producto: la web tiene que ir fina en CUALQUIER dispositivo, y el 3D obligaba a cargar
 * un megachunk de three.js, a medir el rendimiento con una sonda de fotogramas, a decidir en cliente
 * si montarlo, a fundir entre las dos versiones en los dos sentidos y a un error boundary para las
 * GPU bloqueadas. Todo eso desaparece: la versión en CSS es la portada de verdad, sale ya dibujada en
 * el HTML del servidor y cuesta lo que cuesta componer una docena de degradados.
 *
 * COSTE. Nada de filtros ni de `blur` animados: solo `transform` y `opacity`, que el compositor
 * resuelve en GPU sin repintar. Las capas que respiran (el halo de calor, el vaho) están acotadas al
 * tamaño de la tixola y no al viewport, porque una capa a pantalla completa animando opacidad obliga a
 * rellenar el viewport entero en cada fotograma. Y cuando la portada deja de verse, todo se para
 * (`useHeroIdle`).
 *
 * El nombre del fichero y el atributo `data-hero-canvas` del contenedor (que lo pone `<Hero />`) se
 * conservan: `HeroTransition` busca ese atributo para el alejamiento al hacer scroll y la QA visual
 * lo usa para medir que la portada está encendida.
 *
 * El último hijo es el velo que oscurece la capa durante el anclaje de la portada; lo anima
 * `HeroTransition` por su atributo `data-hero-dim`. Va aquí, y no en el hero, porque debe apagar el
 * dibujo sin tocar el texto, y dentro del wrapper porque así hereda su transform y su recorte.
 */
export default function HeroCanvas() {
  const idle = useHeroIdle();
  /* Pausar es más barato que desmontar: no se recompone el árbol al volver y el dibujo sigue intacto. */
  const play: CSSProperties["animationPlayState"] = idle ? "paused" : "running";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-iron">
      <style href="tixola-hero-keyframes" precedence="default">
        {HERO_KEYFRAMES}
      </style>

      {/* Hierro de la plancha: textura real a media opacidad, que es lo que rompe el degradado plano */}
      <div className="absolute inset-0 bg-[url('/textures/iron.webp')] bg-cover bg-center opacity-55" />

      {/* Luz de la parrilla. Sigue a la tixola en cada composición (centro arriba en móvil, derecha en
          escritorio) y es la que da el aire cálido de la portada. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_48%_at_47%_32%,rgba(190,36,44,0.68)_0%,rgba(126,22,28,0.34)_46%,transparent_74%)] lg:bg-[radial-gradient(ellipse_54%_62%_at_67%_52%,rgba(190,36,44,0.7)_0%,rgba(126,22,28,0.36)_44%,transparent_74%)]" />
      {/* Segundo foco, más apretado y anaranjado: el rescoldo. Sin él el glow se lee como un filtro rojo. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_34%_30%_at_47%_31%,rgba(255,122,58,0.42)_0%,rgba(215,80,40,0.16)_45%,transparent_72%)] lg:bg-[radial-gradient(ellipse_26%_34%_at_67%_50%,rgba(255,122,58,0.44)_0%,rgba(215,80,40,0.18)_45%,transparent_72%)]" />
      {/* Suelo: burdeos profundo abajo, con una línea de brasa al fondo. Ancla la escena y deja el pie
          oscuro para que el copy y el fundido con la sección siguiente tengan contraste. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_58%_at_50%_106%,rgba(255,110,52,0.26)_0%,rgba(74,18,24,0.82)_42%,rgba(18,18,18,0.35)_72%,transparent_88%)]" />

      {/* ── La tixola ─────────────────────────────────────────────────────────────────── */}
      <div className={PAN_BOX}>
        {/* Halo de calor que respira. Acotado a la caja de la sartén, no al viewport. */}
        <div
          className="absolute left-1/2 top-1/2 aspect-square w-[195%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,146,80,0.34)_0%,rgba(190,36,44,0.26)_42%,transparent_76%)]"
          style={{ animation: "tixola-heat 7.5s ease-in-out infinite", animationPlayState: play }}
        />
        {/* Brasas bajo el hierro: la luz que sube de la parrilla y separa la sartén del fondo */}
        <div className="absolute left-1/2 top-[60%] h-[44%] w-[106%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,132,62,0.52)_0%,rgba(190,36,44,0.24)_52%,transparent_80%)]" />
        {/* Sombra proyectada, encima de esa luz: el hierro tapa las brasas que tiene justo debajo */}
        <div className="absolute left-1/2 top-[57%] h-[30%] w-[84%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.74)_0%,rgba(0,0,0,0.3)_58%,transparent_82%)]" />

        {/* Flotación lenta. `perspective` en el envoltorio para que la inclinación tenga fuga. */}
        <div className="animate-float [perspective:1100px]" style={{ animationPlayState: play }}>
          <div className="relative aspect-square [transform:rotateX(58deg)] [transform-style:preserve-3d]">
            {/* Aro de hierro fundido. `conic-gradient` en vez de un radial: la luz recorre la
                circunferencia (clara arriba a la izquierda, apagada abajo), que es lo que hace que el
                metal parezca metal y no un disco gris. */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_196deg,#4d4842_0deg,#232019_38deg,#3a3630_76deg,#151412_140deg,#0a0a09_188deg,#2a2723_236deg,#454039_288deg,#191816_332deg,#4d4842_360deg)] shadow-[0_46px_70px_-18px_rgba(0,0,0,0.85),0_12px_26px_rgba(0,0,0,0.6)]" />
            {/* Luz caliente lamiendo el canto más cercano a las brasas */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_118deg,transparent_0deg,rgba(255,158,88,0.5)_46deg,rgba(255,204,150,0.24)_76deg,transparent_124deg)]" />
            {/* Canto interior: da grosor al aro y hueco al recipiente */}
            <div className="absolute inset-[7%] rounded-full bg-[radial-gradient(circle_at_44%_28%,#302d29_0%,#141312_54%,#070706_100%)] shadow-[inset_0_2px_7px_rgba(255,192,142,0.16),inset_0_-16px_28px_rgba(0,0,0,0.78)]" />
            {/* Aceite caliente: dorado donde le entra la luz, tostado al fondo y casi negro contra la
                pared de la sartén. El escalón oscuro del 70 % al 92 % es el que le da hondura; sin él
                el aceite se lee como una superficie plana pintada de marrón. */}
            <div className="absolute inset-[15%] rounded-full bg-[radial-gradient(circle_at_38%_28%,rgba(255,231,170,0.9)_0%,rgba(232,166,68,0.78)_22%,rgba(166,92,27,0.72)_48%,rgba(104,50,14,0.82)_70%,rgba(44,18,6,0.94)_92%)] shadow-[inset_0_14px_30px_rgba(0,0,0,0.55),inset_0_-10px_22px_rgba(255,140,60,0.22)]" />
            {/* Reflejo especular: una elipse grande y otra pequeña, que es lo que lo vuelve líquido */}
            <div className="absolute left-[24%] top-[22%] h-[9%] w-[25%] -rotate-[18deg] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,251,238,0.72)_0%,transparent_78%)]" />
            <div className="absolute left-[58%] top-[62%] h-[5%] w-[14%] rotate-[12deg] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,236,196,0.4)_0%,transparent_80%)]" />

            {/* Burbujas y pimentón */}
            {GARNISH.map((g, i) => (
              <span
                key={i}
                className={cn(
                  "absolute rounded-full",
                  g.kind === "ring"
                    ? "bg-[radial-gradient(closest-side,transparent_38%,rgba(255,236,192,0.55)_66%,rgba(180,104,34,0.35)_84%,transparent_100%)]"
                    : "bg-[radial-gradient(closest-side,rgba(214,78,32,0.9)_0%,rgba(150,48,18,0.5)_70%,transparent_100%)]",
                )}
                style={{ left: `${g.left}%`, top: `${g.top}%`, width: `${g.size}%`, height: `${g.size}%` }}
              />
            ))}

            {/* Zamburiñas */}
            {SCALLOPS.map((s, i) => (
              <span
                key={i}
                className="absolute"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: `${s.size}%`,
                  height: `${s.size}%`,
                  transform: `rotate(${s.tilt}deg)`,
                }}
              >
                {/* Carne de la vieira */}
                <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_26%,#fff9ec_0%,#f3e3c8_38%,#ddbb86_66%,#ab7431_100%)] shadow-[0_6px_11px_rgba(0,0,0,0.55),inset_0_-3px_7px_rgba(122,66,17,0.5)]" />
                {/* Tostado de la plancha en la parte que toca el hierro */}
                <span className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_54%_70%,rgba(192,98,26,0.72)_0%,rgba(198,110,32,0.28)_52%,transparent_76%)]" />
                {/* El aceite moja el borde: un filo tostado alrededor de la pieza */}
                <span className="absolute -inset-[7%] rounded-full bg-[radial-gradient(closest-side,transparent_62%,rgba(126,62,16,0.5)_82%,transparent_100%)]" />
                {/* Un filo de luz: a este tamaño sustituye a las estrías de la concha */}
                <span className="absolute left-[17%] top-[21%] h-[17%] w-[44%] -rotate-12 rounded-[50%] bg-[linear-gradient(90deg,rgba(255,255,255,0.75)_0%,transparent_100%)]" />
              </span>
            ))}

            {/* Mango con remaches y anilla */}
            <div className="absolute left-[91%] top-1/2 h-[7.5%] w-[52%] -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,#403d38_0%,#1d1b19_44%,#0a0a09_100%)] shadow-[0_18px_28px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,214,170,0.22)] lg:w-[62%]">
              <span className="absolute left-[7%] top-1/2 h-[44%] w-[2.5%] -translate-y-1/2 rounded-full bg-[#4f4a44]" />
              <span className="absolute left-[15%] top-1/2 h-[44%] w-[2.5%] -translate-y-1/2 rounded-full bg-[#413d38]" />
              {/* Anilla hueca: se ve el fondo por dentro, como en una tixola de verdad */}
              <span className="absolute right-[2%] top-1/2 aspect-square h-[150%] -translate-y-1/2 rounded-full border-2 border-[#3a3733] shadow-[inset_0_1px_0_rgba(255,214,170,0.18)] lg:border-[3px]" />
            </div>
          </div>
        </div>

        {/* Vaho sobre el aceite. Fuera del plano inclinado: el vapor sube recto, no por la sartén. */}
        {STEAM.map((s, i) => (
          <span
            key={i}
            className="absolute bottom-[46%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,242,224,0.34)_0%,rgba(255,236,212,0.12)_52%,transparent_78%)] opacity-0"
            style={{
              left: `${s.left}%`,
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

      {/* Viñeta: cierra el encuadre y manda la mirada al centro caliente */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.58)_100%)]" />

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
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_45%,rgba(12,12,12,0.45)_0%,rgba(12,12,12,0.78)_48%,rgba(12,12,12,1)_100%)] opacity-0"
      />
    </div>
  );
}
