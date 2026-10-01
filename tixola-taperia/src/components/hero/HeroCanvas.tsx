"use client";

import { useEffect, useState, type CSSProperties } from "react";
import HeroMark, { HERO_MARK_RATIO } from "@/components/hero/HeroMark";
import { useHeroStillVisible } from "@/components/scroll/HeroTransition";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   La banda de la marca en móvil
   ────────────────────────────────────────────────────────────── */

/**
 * Ancho de la caja de la sartén en la composición apilada (por debajo de `lg`), como expresión CSS.
 * Lo consume `MARK_BAND` (vía la variable `--marca-w`) y lo exporta para que `<Hero />` reserve
 * encima del copy una banda de exactamente esa altura (`--marca-h`): marca y texto se reparten la
 * pantalla por contrato, no por una fórmula que dependa de cuánto mide el copy en cada idioma.
 *  · 78vw: la sartén manda en la primera pantalla; con menos, en un teléfono es un adorno.
 *  · 36svh: solo muerde en horizontal (un móvil tumbado mide ~390 px de alto), donde 78vw sería más
 *    alto que la pantalla.
 *  · 320px: por encima (tablets en vertical) ya es grande y el copy necesita su sitio.
 *
 * SOLO VALE PARA MÓVIL. En escritorio la sartén no vive aquí: cuelga del final de la primera línea
 * del titular (ver el "titular fantasma" en `Hero.tsx`), porque el cliente la quiere enganchada a la
 * "o" de "Tapeo" y eso no se consigue con un porcentaje de la ventana — la línea mide distinto en
 * cada idioma y en cada ancho.
 */
export const HERO_MARK_BAND_WIDTH = "min(78vw, 36svh, 320px)";
/** Alto de esa banda, derivado de la proporción real del dibujo. */
export const HERO_MARK_BAND_HEIGHT = `calc(${HERO_MARK_BAND_WIDTH} * ${HERO_MARK_RATIO.toFixed(4)})`;

/* ──────────────────────────────────────────────────────────────
   Keyframes propias de la portada
   ────────────────────────────────────────────────────────────── */

/**
 * Viajan con el componente (React 19 iza el `<style href>` al `<head>` y lo deduplica por `href`) en
 * vez de vivir en `globals.css`: son exclusivas de esta portada, mientras que las del tema —`float`,
 * `ember-rise`, `neon-pulse`— las comparten varias secciones.
 *
 * Aquí vivió una FOTO de un plato del local, con su vaho (`tixola-steam`), su sombra de levitación y
 * una inclinación en `rotateX` para que no se leyera como una pegatina. Todo eso se fue con la foto:
 * el vapor sale de un plato caliente, no de un dibujo a línea, y un isotipo ES plano y frontal.
 * `tixola-heat` se queda — el halo de calor sigue respirando detrás de la marca— y las de la propia
 * marca (entrada y brillo) viven en `HeroMark`, que es quien las usa en las dos composiciones.
 */
const HERO_KEYFRAMES = `
@keyframes tixola-heat {
  0%, 100% { opacity: 0.76; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
}
`;

/**
 * La banda de la marca en móvil: centrada bajo la cabecera, con el copy empezando donde termina
 * (`<Hero />` reserva `--marca-h` de padding). Si con eso el copy no cabe en 100svh, la portada crece
 * y se hace scroll: es la elección de una portada de revista, marca grande antes que todo en un
 * pantallazo. `HeroTransition` sabe anclar una portada más alta que la pantalla (ancla por el pie).
 *
 * `lg:hidden` porque de ahí para arriba la sartén la pinta el titular fantasma de `Hero.tsx`.
 */
const MARK_BAND = cn(
  "absolute left-1/2 top-[calc(var(--header-h)+1.25rem)] w-[var(--marca-w)] -translate-x-1/2",
  "lg:hidden",
);

/**
 * Brasas que suben del hierro. Deterministas (nada de `Math.random()`: el HTML del servidor y el del
 * cliente tienen que coincidir) y en % de la banda, no del viewport. Solo acompañan a la composición
 * de móvil: en escritorio la sartén está metida en el titular y rodearla de chispas allí sería
 * llenar de puntos naranjas el hueco entre dos líneas de texto.
 */
const EMBERS: readonly { left: number; bottom: number; size: number; delay: number; duration: number }[] = [
  { left: 12, bottom: 6, size: 3, delay: 0, duration: 4.2 },
  { left: 26, bottom: 13, size: 2, delay: 0.7, duration: 4.9 },
  { left: 40, bottom: 2, size: 4, delay: 1.4, duration: 3.8 },
  { left: 54, bottom: 16, size: 2, delay: 2.2, duration: 5.4 },
  { left: 68, bottom: 8, size: 3, delay: 0.4, duration: 4.4 },
  { left: 82, bottom: 11, size: 2, delay: 2.7, duration: 4.6 },
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
 * Fondo de la portada: hierro fundido con la luz de las brasas y, en móvil, la sartén de la marca
 * en su propia banda.
 *
 * Aquí vivió un lienzo WebGL (react-three-fiber), después un dibujo de la tixola hecho enteramente
 * en CSS, después una foto real de un plato del local y, un rato, el logotipo entero con su texto.
 * Lo que queda es el isotipo solo, que es lo que pidió el cliente.
 *
 * EN ESCRITORIO ESTA CAPA YA NO PINTA LA MARCA, solo el ambiente. La sartén cuelga del final de la
 * primera línea del titular, y eso vive en `Hero.tsx` porque es donde está el titular: para
 * engancharla a la "o" hay que compartir su maqueta, no adivinar su anchura desde fuera.
 *
 * COSTE. Nada de filtros ni de `blur` animados: solo `transform` y `opacity`, que el compositor
 * resuelve en la GPU sin repintar.
 *
 * El atributo `data-hero-canvas` del contenedor (que lo pone `<Hero />`) se usa como ancla del
 * módulo de scroll cinematográfico y de la QA visual: no cambiarlo sin mirar `HeroTransition`.
 *
 * El último hijo es el velo que oscurece la capa durante el anclaje de la portada; lo anima
 * `HeroTransition` por su atributo `data-hero-dim`.
 */
export default function HeroCanvas() {
  const idle = useHeroIdle();
  /* Pausar es más barato que desmontar: no se recompone el árbol al volver. */
  const play: CSSProperties["animationPlayState"] = idle ? "paused" : "running";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-granate">
      <style href="tixola-hero-keyframes" precedence="default">
        {HERO_KEYFRAMES}
      </style>

      {/* ── Ambiente: hierro y brasas ─────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0">
        {/* Hierro de la plancha: textura real a media opacidad, que es lo que rompe el degradado plano */}
        <div className="absolute inset-0 bg-[url('/textures/iron.webp')] bg-cover bg-center opacity-55" />

        {/* Luz de la parrilla. Sigue a la marca en cada composición: arriba y centrada en móvil; en
            escritorio, hacia el final de la primera línea del titular, que es donde cuelga la sartén
            (el foco es ancho y suave, así que le basta con un porcentaje aproximado — a diferencia
            del dibujo, que sí necesita ir clavado). */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_44%_at_50%_26%,rgba(172,32,34,0.68)_0%,rgba(112,17,18,0.34)_46%,transparent_74%)] lg:bg-[radial-gradient(ellipse_52%_54%_at_64%_38%,rgba(172,32,34,0.66)_0%,rgba(112,17,18,0.34)_44%,transparent_74%)]" />
        {/* Segundo foco, más apretado y anaranjado: el rescoldo. Sin él el glow se lee como un filtro rojo. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_34%_26%_at_50%_25%,rgba(255,122,58,0.4)_0%,rgba(215,80,40,0.16)_45%,transparent_72%)] lg:bg-[radial-gradient(ellipse_24%_30%_at_64%_37%,rgba(255,122,58,0.4)_0%,rgba(215,80,40,0.16)_45%,transparent_72%)]" />
        {/* Suelo: burdeos profundo abajo, con una línea de brasa al fondo. Ancla la escena y deja el pie
            oscuro para que el copy y el fundido con la sección siguiente tengan contraste. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_58%_at_50%_106%,rgba(255,110,52,0.26)_0%,rgba(74,15,16,0.82)_42%,rgba(59,22,19,0.35)_72%,transparent_88%)]" />
      </div>

      {/* ── La marca, solo en móvil ───────────────────────────────────────────────────── */}
      <div className={MARK_BAND}>
        <HeroMark play={play} float />

        {/* Chispas, por delante del dibujo */}
        <div aria-hidden className="absolute inset-0">
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
        alejamiento se lea como una pérdida de foco y no como "se apaga la luz". Cuesta lo que un
        color plano: una capa que el compositor mezcla, sin filtro. Aquí hubo un
        `filter: blur(0 → 6px)` interpolado por fotograma sobre esta misma superficie, la más cara de
        toda la web; no vuelve.
      */}
      <div
        data-hero-dim
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_45%,rgba(42,15,13,0.45)_0%,rgba(42,15,13,0.78)_48%,rgba(42,15,13,1)_100%)] opacity-0"
      />
    </div>
  );
}
