"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus, RotateCcw, Wine as WineIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import VinoSpotlight, { nombreDeOrigen } from "@/components/vinos/VinoSpotlight";
import { MUNDO_PAISES, MUNDO_VIEWBOX, proyectar } from "@/data/geo/mundo";
import { formatPrice } from "@/data/menu";
import { NATION_IDS, NATIONS, ORIGIN_NATION, ORIGIN_ORDER, SHOW_WINE_PRICES, winesByOrigin, type NationId, type Wine, type WineOrigin } from "@/data/wines";
import { localizeMenuItems } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * EL MAPA DEL MUNDO — de dónde viene cada botella de la carta.
 *
 * Lo pidió el cliente así: "que la persona viera el mapa con todos los países que tienen los vinos,
 * pincho en uno y me salen los suyos". Y antes, con el mapa de Galicia: "lo que más me apetece es
 * uno de Monterrei, pues pincho y que me salgan todos los de Monterrei con la foto". Es el mismo
 * recorrido, un escalón más arriba: mundo → país → denominación → botella → ficha.
 *
 * POR QUÉ UN SVG DE VERDAD Y NO UNA IMAGEN. Una imagen del mundo con chinchetas dibujadas encima es
 * media hora de trabajo y se ve bien en la pantalla del que la hizo. Pero no se puede ampliar sin
 * que se pixele, no se puede navegar con el teclado, no hay forma de que un lector de pantalla diga
 * "España, 29 vinos", y para cambiarle el color hay que volver a exportarla. El contorno está en
 * `src/data/geo/mundo.ts` —Natural Earth 1:110m, dominio público— ya proyectado, y aquí solo se
 * pinta. Cuesta unos 40 kB comprimidos; es lo que vale que el mapa sea de verdad.
 *
 * LA NAVEGACIÓN (zoom y arrastre) ESTÁ HECHA A MANO, sin librería de mapas. Son treinta líneas: un
 * estado {x, y, k}, un `transform` en un `<g>` y tres gestos. Meter Leaflet o MapLibre aquí sería
 * traer 150 kB y un mapa de teselas que hay que ir a buscar a un servidor ajeno, para enseñar cinco
 * chinchetas sobre un contorno que ya está en el HTML.
 *
 * LAS CHINCHETAS SON POR PAÍS, NO POR DENOMINACIÓN. Con dieciséis procedencias, once de ellas
 * españolas y cinco de esas en Galicia, a escala mundial se amontonarían en una mancha ilegible. El
 * país es el nivel que se lee de un vistazo; dentro de la tarjeta sí aparecen todas sus
 * denominaciones, y desde ahí se baja a la botella.
 *
 * COLORES. Los eligió el cliente —fondo chocolate (#2B1810 → #3D2415), tierra algo más clara con
 * los bordes en crema fina, chinchetas en ámbar (#C9962E → #F0D080)—, y se respetan tal cual. Son
 * los únicos de la web que no salen de la paleta granate: un mapa es un objeto, como una lámina
 * enmarcada, y funciona mejor con su propio color que repitiendo el de la página.
 */

/* ──────────────────────────────────────────────────────────────
   Colores del mapa (los del cliente, en un sitio y no repartidos)
   ────────────────────────────────────────────────────────────── */

const COLOR = {
  fondo: "#2B1810",
  /* La tierra ERA casi tan oscura como el mar y las fronteras no se leían: el mapa parecía una
     mancha. Subida a un marrón medio, con el borde en crema a un tercio de opacidad, se distingue
     país por país sin que el fondo deje de ser chocolate. */
  tierra: "#5C3A26",
  tierraActiva: "#8A5A33",
  tierraEncima: "#A06C3E",
  borde: "rgba(246,244,231,0.32)",
  bordeActivo: "rgba(240,208,128,0.9)",
  chinchetaOscura: "#C9962E",
  chinchetaClara: "#F0D080",
} as const;

/* ──────────────────────────────────────────────────────────────
   Encuadre: zoom y arrastre
   ────────────────────────────────────────────────────────────── */

/** Qué trozo del lienzo se ve. `k` es la ampliación; `x`/`y`, el desplazamiento en unidades de lienzo. */
interface Encuadre {
  x: number;
  y: number;
  k: number;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 7;

/**
 * Se abre con el MUNDO ENTERO a la vista, no con Europa. Es un mapa del mundo: lo primero que tiene
 * que contar es que hay vino de cinco países en tres continentes, y eso solo se ve si se ven los
 * cinco a la vez. Quien quiera acercarse, amplía; y los botones de debajo llevan a cada país de un
 * toque, que es la forma de llegar a Mendoza sin pelearse con un mapa en un teléfono.
 */
const INICIO: Encuadre = { x: 0, y: 0, k: 1 };

/** Mantiene el encuadre dentro del lienzo: por mucho que se arrastre, no se puede sacar el mapa de la caja. */
function encajar({ x, y, k }: Encuadre): Encuadre {
  const kk = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, k));
  const maxX = 0;
  const minX = MUNDO_VIEWBOX.width * (1 - kk);
  const maxY = 0;
  const minY = MUNDO_VIEWBOX.height * (1 - kk);
  return { k: kk, x: Math.min(maxX, Math.max(minX, x)), y: Math.min(maxY, Math.max(minY, y)) };
}

/** Amplía o reduce alrededor de un punto del lienzo, para que lo que hay bajo el dedo no se mueva. */
function ampliarEn(enc: Encuadre, factor: number, px: number, py: number): Encuadre {
  const k = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, enc.k * factor));
  const real = k / enc.k;
  return encajar({ k, x: px - (px - enc.x) * real, y: py - (py - enc.y) * real });
}

/* ──────────────────────────────────────────────────────────────
   El componente
   ────────────────────────────────────────────────────────────── */

export default function MapaDelMundo() {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const reducido = useReducedMotion();
  const tituloId = useId();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [encuadre, setEncuadre] = useState<Encuadre>(INICIO);
  const [paisAbierto, setPaisAbierto] = useState<NationId | null>(null);
  const [paisEncima, setPaisEncima] = useState<NationId | null>(null);
  const [vinoAbierto, setVinoAbierto] = useState<Wine | null>(null);

  /* Punteros activos, para distinguir arrastre (uno) de pellizco (dos). Van en una `ref` y no en el
     estado: cambian en cada `pointermove` y volver a pintar en cada uno sería tirar fotogramas. */
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const pellizco = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  const arrastrado = useRef(false);

  const nombreDePlato = useMemo(
    () => new Map(localizeMenuItems(locale).map((plato) => [plato.id, plato.name])),
    [locale],
  );

  /** Los vinos de cada país, agrupados por denominación y en el orden de la carta. */
  const porPais = useMemo(() => {
    const mapa = new Map<NationId, { origin: WineOrigin; vinos: readonly Wine[] }[]>();
    for (const origin of ORIGIN_ORDER) {
      const vinos = winesByOrigin(origin);
      if (!vinos.length) continue;
      const pais = ORIGIN_NATION[origin];
      const lista = mapa.get(pais) ?? [];
      lista.push({ origin, vinos });
      mapa.set(pais, lista);
    }
    return mapa;
  }, []);

  /** Solo los países que de verdad tienen vino en la carta; si mañana no hay ninguno, no hay mapa. */
  const naciones = useMemo(() => NATION_IDS.filter((id) => (porPais.get(id)?.length ?? 0) > 0), [porPais]);

  /**
   * Del nombre que usa Natural Earth al país nuestro. Antes esto era solo un conjunto de nombres
   * para pintarlos distintos; ahora es un mapa porque LA SILUETA ENTERA ES PULSABLE: pinchar en
   * España abre sus vinos igual que pinchar su chincheta. Lo pidió el cliente, y tiene razón —
   * acertarle a un país es mucho más fácil que acertarle a una chincheta, sobre todo con el dedo.
   */
  const paisPorNombre = useMemo(
    () => new Map(naciones.map((id) => [NATIONS[id].naturalEarth, id])),
    [naciones],
  );

  /** Píxel de pantalla → punto del lienzo (hace falta para ampliar donde está el cursor). */
  const aLienzo = useCallback((clientX: number, clientY: number) => {
    const caja = svgRef.current?.getBoundingClientRect();
    if (!caja) return { px: MUNDO_VIEWBOX.width / 2, py: MUNDO_VIEWBOX.height / 2 };
    return {
      px: ((clientX - caja.left) / caja.width) * MUNDO_VIEWBOX.width,
      py: ((clientY - caja.top) / caja.height) * MUNDO_VIEWBOX.height,
    };
  }, []);

  /** Cuántas unidades de lienzo mide un píxel de pantalla (para que el arrastre vaya 1:1 con el dedo). */
  const porPixel = useCallback(() => {
    const caja = svgRef.current?.getBoundingClientRect();
    return caja ? MUNDO_VIEWBOX.width / caja.width : 1;
  }, []);

  /**
   * EL PUNTERO NO SE CAPTURA AL APOYAR, SINO AL EMPEZAR A ARRASTRAR DE VERDAD, y la diferencia no es
   * un detalle: cuando un elemento captura el puntero, el navegador le manda a ÉL el `click`
   * posterior en vez de a lo que haya debajo. Capturando en el `pointerdown`, el `click` se lo
   * quedaba el `<svg>` entero y los `onClick` de los países y de las chinchetas no llegaban a
   * ejecutarse nunca: el mapa se arrastraba de maravilla y no se podía pinchar nada.
   *
   * Capturando solo cuando el dedo ya se ha movido unos píxeles se tienen las dos cosas: un clic
   * limpio llega a su país, y un arrastre sigue funcionando aunque el dedo se salga del mapa.
   */
  const alBajarPuntero = (e: ReactPointerEvent<SVGSVGElement>) => {
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    arrastrado.current = false;
  };

  const alMoverPuntero = (e: ReactPointerEvent<SVGSVGElement>) => {
    const anterior = punteros.current.get(e.pointerId);
    if (!anterior) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const activos = [...punteros.current.values()];

    if (activos.length >= 2) {
      /* Pellizco: la separación entre los dos dedos es la ampliación, y su punto medio, el centro. */
      const [a, b] = activos;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const medio = aLienzo((a.x + b.x) / 2, (a.y + b.y) / 2);
      const previo = pellizco.current;
      if (previo && previo.dist > 0) {
        setEncuadre((enc) => ampliarEn(enc, dist / previo.dist, medio.px, medio.py));
      }
      pellizco.current = { dist, cx: medio.px, cy: medio.py };
      arrastrado.current = true;
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    const escala = porPixel();
    const dx = (e.clientX - anterior.x) * escala;
    const dy = (e.clientY - anterior.y) * escala;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) {
      arrastrado.current = true;
      /* Ahora sí: esto es un arrastre, así que se captura el puntero para que seguir moviéndose
         fuera del mapa no lo interrumpa. */
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId);
    }
    setEncuadre((enc) => encajar({ ...enc, x: enc.x + dx, y: enc.y + dy }));
  };

  const alSoltarPuntero = (e: ReactPointerEvent<SVGSVGElement>) => {
    punteros.current.delete(e.pointerId);
    if (punteros.current.size < 2) pellizco.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  /**
   * LA RUEDA AMPLÍA Y LA PÁGINA NO SE MUEVE. Parece una tontería y no lo es: el `onWheel` de React
   * se registra como oyente PASIVO, y un oyente pasivo no puede llamar a `preventDefault()` — el
   * navegador lo ignora y avisa por consola. Resultado: la rueda ampliaba el mapa Y desplazaba la
   * página a la vez, que es justo lo que no se quiere. Por eso el oyente se pone a mano, con
   * `{ passive: false }`, que es la única forma de que `preventDefault()` cuente.
   *
   * El del dedo ya estaba resuelto por el `touch-action: none` del SVG.
   */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const alRodar = (e: WheelEvent) => {
      e.preventDefault();
      const { px, py } = aLienzo(e.clientX, e.clientY);
      /* Solo cuenta el signo: hay ratones que mandan 3 y paneles táctiles que mandan 300, y usar el
         valor crudo hace que con unos el mapa no se mueva y con otros se dispare. */
      setEncuadre((enc) => ampliarEn(enc, e.deltaY < 0 ? 1.15 : 1 / 1.15, px, py));
    };
    svg.addEventListener("wheel", alRodar, { passive: false });
    return () => svg.removeEventListener("wheel", alRodar);
  }, [aLienzo]);

  /** Lleva el encuadre a un país y abre su tarjeta. Es lo que hacen los botones de debajo del mapa. */
  const irA = useCallback((id: NationId) => {
    const { x, y } = proyectar(...NATIONS[id].lonLat);
    const k = 3.4;
    setEncuadre(encajar({ k, x: MUNDO_VIEWBOX.width / 2 - x * k, y: MUNDO_VIEWBOX.height / 2 - y * k }));
    setPaisAbierto(id);
  }, []);

  const reiniciar = useCallback(() => {
    setEncuadre(INICIO);
    setPaisAbierto(null);
  }, []);

  if (!naciones.length) return null;

  const totalVinos = naciones.reduce((n, id) => n + (porPais.get(id) ?? []).reduce((v, g) => v + g.vinos.length, 0), 0);

  return (
    <section aria-labelledby={tituloId} className="container-page pb-14 md:pb-20">
      <p data-reveal="fade" className="font-caps text-xs uppercase tracking-[0.3em] text-pimenton-a11y">{m.vinos.mapWorldKicker}</p>
      <h2 data-reveal id={tituloId} className="mt-3 max-w-2xl font-display text-3xl font-medium leading-[1.02] text-cream text-balance md:text-4xl">
        {m.vinos.mapWorldTitle}
      </h2>
      <p data-reveal="fade" className="mt-3 max-w-xl text-sm leading-relaxed text-cream-muted text-pretty md:text-base">
        {t(m.vinos.mapWorldLead, { count: totalVinos, countries: naciones.length })}
      </p>

      {/* Solo fundido (`fade`), nunca deslizamiento: el mapa se arrastra y se hace zoom leyendo
          coordenadas de pantalla, y moverlo mientras entra las descolocaría. */}
      <div data-reveal="fade" className="relative mt-6 overflow-hidden rounded-3xl border border-cream/10 shadow-card" style={{ background: COLOR.fondo }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MUNDO_VIEWBOX.width} ${MUNDO_VIEWBOX.height}`}
          /* 16:10 en el teléfono y 2:1 en escritorio: en vertical un mapa apaisado entero se queda
             en una tira de nada, así que se enseña más alto y se navega. */
          /* 16:10 en el teléfono y 2:1 en escritorio —la proporción del lienzo—, pero sin pasar de
             media pantalla de alto: en un monitor ancho, un 2:1 a sangre son 900 px de mapa y la
             página entera desaparece debajo. */
          className="block aspect-[16/11] max-h-[62vh] min-h-[360px] w-full touch-none select-none md:aspect-[2/1] md:min-h-0"
          role="img"
          aria-label={t(m.vinos.mapWorldAria, { count: totalVinos, countries: naciones.length })}
          onPointerDown={alBajarPuntero}
          onPointerMove={alMoverPuntero}
          onPointerUp={alSoltarPuntero}
          onPointerCancel={alSoltarPuntero}
        >
          <defs>
            {/* El fondo del mapa llevaba un degradado radial que aclaraba el centro. Lo quitó el
                cliente —"no hace falta que brille"— y tenía razón: en un mapa, cualquier mancha de
                luz que no sea tierra se lee como información y no lo es. Fondo plano. */}
            <radialGradient id="mapa-chincheta" cx="38%" cy="32%" r="70%">
              <stop offset="0%" stopColor={COLOR.chinchetaClara} />
              <stop offset="100%" stopColor={COLOR.chinchetaOscura} />
            </radialGradient>
          </defs>

          <rect width={MUNDO_VIEWBOX.width} height={MUNDO_VIEWBOX.height} fill={COLOR.fondo} />

          <g transform={`translate(${encuadre.x} ${encuadre.y}) scale(${encuadre.k})`}>
            {/* Los 176 contornos. `vectorEffect` mantiene el borde a 0,6 px aunque se amplíe siete
                veces: sin eso, al acercarse las fronteras se convierten en morcillas. */}
            <g strokeLinejoin="round">
              {MUNDO_PAISES.map((pais) => {
                const nuestro = paisPorNombre.get(pais.name);
                if (!nuestro) {
                  /* Los otros 171. No son pulsables ni tienen `title`: son el fondo sobre el que se
                     leen los cinco que importan, y un mapa en el que todo responde no dirige a nada. */
                  return (
                    <path
                      key={pais.id}
                      d={pais.d}
                      fill={COLOR.tierra}
                      stroke={COLOR.borde}
                      strokeWidth={0.6}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }
                const encima = paisEncima === nuestro;
                const abierto = paisAbierto === nuestro;
                return (
                  <path
                    key={pais.id}
                    d={pais.d}
                    /* Pulsable con el ratón y con el dedo, pero NO es una parada del tabulador ni la
                       anuncia el lector de pantalla: de cada país ya hay dos — su chincheta, aquí al
                       lado, y su botón debajo del mapa. Tres anuncios de "España, 46 vinos" seguidos
                       no son más accesible, son ruido. */
                    aria-hidden
                    fill={encima || abierto ? COLOR.tierraEncima : COLOR.tierraActiva}
                    stroke={COLOR.bordeActivo}
                    strokeWidth={abierto ? 2 : 1.2}
                    vectorEffect="non-scaling-stroke"
                    className="cursor-pointer transition-[fill] duration-200 focus-visible:outline-none"
                    onPointerEnter={() => setPaisEncima(nuestro)}
                    onPointerLeave={() => setPaisEncima((previo) => (previo === nuestro ? null : previo))}
                    onClick={() => {
                      if (arrastrado.current) return;
                      setPaisAbierto((previo) => (previo === nuestro ? null : nuestro));
                    }}
                  />
                );
              })}
            </g>

            {/* Las chinchetas, contraescaladas para que no engorden al ampliar. */}
            {naciones.map((id) => {
              const { x, y } = proyectar(...NATIONS[id].lonLat);
              const grupos = porPais.get(id) ?? [];
              const cuantos = grupos.reduce((n, g) => n + g.vinos.length, 0);
              return (
                <g key={id} transform={`translate(${x} ${y}) scale(${1 / encuadre.k})`}>
                  <Chincheta
                    etiqueta={
                      cuantos === 1
                        ? t(m.vinos.mapWorldPinOne, { country: m.vinos.nations[id] })
                        : t(m.vinos.mapWorldPin, { country: m.vinos.nations[id], count: cuantos })
                    }
                    abierta={paisAbierto === id}
                    pulso={!reducido}
                    onAbrir={() => {
                      /* Si el dedo venía arrastrando el mapa, esto no es un clic: es el final de un
                         gesto. Sin esta guarda, mover el mapa abría la tarjeta del país que quedara
                         debajo al soltar. */
                      if (arrastrado.current) return;
                      setPaisAbierto((previo) => (previo === id ? null : id));
                    }}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Mandos de zoom. Están porque no todo el mundo tiene rueda ni sabe pellizcar, y porque con
            el teclado son la única forma de ampliar. */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <BotonMapa
            etiqueta={m.vinos.mapZoomIn}
            onClick={() => setEncuadre((enc) => ampliarEn(enc, 1.5, MUNDO_VIEWBOX.width / 2, MUNDO_VIEWBOX.height / 2))}
          >
            <Plus size={16} aria-hidden />
          </BotonMapa>
          <BotonMapa
            etiqueta={m.vinos.mapZoomOut}
            onClick={() => setEncuadre((enc) => ampliarEn(enc, 1 / 1.5, MUNDO_VIEWBOX.width / 2, MUNDO_VIEWBOX.height / 2))}
          >
            <Minus size={16} aria-hidden />
          </BotonMapa>
          <BotonMapa etiqueta={m.vinos.mapReset} onClick={reiniciar}>
            <RotateCcw size={15} aria-hidden />
          </BotonMapa>
        </div>

        <p className="pointer-events-none absolute bottom-2.5 left-4 text-[10px] text-cream/35">{m.vinos.mapWorldCredit}</p>

        {/* La tarjeta del país. En el teléfono ocupa el ancho abajo; en escritorio flota a la izquierda. */}
        <AnimatePresence>
          {paisAbierto ? (
            <TarjetaDePais
              key={paisAbierto}
              pais={paisAbierto}
              grupos={porPais.get(paisAbierto) ?? []}
              onCerrar={() => setPaisAbierto(null)}
              onVino={setVinoAbierto}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Los cinco países, en botones. Es la versión que funciona siempre: con el teclado, con un
          lector de pantalla, y para quien no quiera pelearse con un mapa en un teléfono. */}
      <ul data-reveal="fade" className="mt-4 flex flex-wrap gap-2">
        {naciones.map((id) => {
          const cuantos = (porPais.get(id) ?? []).reduce((n, g) => n + g.vinos.length, 0);
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => irA(id)}
                aria-pressed={paisAbierto === id}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-caps text-[11px] uppercase tracking-[0.16em] transition-colors",
                  paisAbierto === id
                    ? "border-gold/60 bg-gold/10 text-cream"
                    : "border-cream/15 text-cream-muted hover:border-cream/40 hover:text-cream",
                )}
              >
                {m.vinos.nations[id]}
                <span className="text-cream-faint">{cuantos}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <VinoSpotlight vino={vinoAbierto} onClose={() => setVinoAbierto(null)} nombreDePlato={nombreDePlato} />
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   Piezas
   ────────────────────────────────────────────────────────────── */

/** Botón redondo de los mandos del mapa. */
function BotonMapa({ etiqueta, onClick, children }: { etiqueta: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 bg-black/35 text-cream/80 backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
    >
      {children}
    </button>
  );
}

/**
 * La chincheta: gota ámbar con un halo que late. El `<circle>` transparente de debajo es el área de
 * pulsación — 22 unidades de radio, que con la contraescala son unos 22 px reales: lo mínimo para
 * acertar con el dedo en un teléfono, y mucho más grande que el dibujo.
 */
function Chincheta({
  etiqueta,
  abierta,
  pulso,
  onAbrir,
}: {
  etiqueta: string;
  abierta: boolean;
  pulso: boolean;
  onAbrir: () => void;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={etiqueta}
      aria-pressed={abierta}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAbrir();
        }
      }}
      className="cursor-pointer focus-visible:outline-none"
    >
      <title>{etiqueta}</title>
      {pulso ? (
        <circle r="9" cy="-9" fill={COLOR.chinchetaClara} opacity="0.35">
          <animate attributeName="r" values="7;17;7" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.38;0;0.38" dur="2.8s" repeatCount="indefinite" />
        </circle>
      ) : null}
      {/* La gota: círculo arriba y punta abajo, apuntando al sitio exacto (0,0 es la coordenada). */}
      <path
        d="M0 0 C -5.5 -7 -8 -10 -8 -13.5 A 8 8 0 1 1 8 -13.5 C 8 -10 5.5 -7 0 0 Z"
        fill="url(#mapa-chincheta)"
        stroke={abierta ? "#FFF6E0" : "rgba(43,24,16,0.6)"}
        strokeWidth={abierta ? 1.6 : 1}
        vectorEffect="non-scaling-stroke"
      />
      <circle r="3" cy="-13.5" fill={COLOR.fondo} opacity="0.85" />
      <circle r="22" cy="-11" fill="transparent" />
    </g>
  );
}

/** La tarjeta de un país: sus denominaciones y, dentro de cada una, sus botellas. */
function TarjetaDePais({
  pais,
  grupos,
  onCerrar,
  onVino,
}: {
  pais: NationId;
  grupos: { origin: WineOrigin; vinos: readonly Wine[] }[];
  onCerrar: () => void;
  onVino: (vino: Wine) => void;
}) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const total = grupos.reduce((n, g) => n + g.vinos.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-x-2 bottom-2 flex max-h-[82%] flex-col overflow-hidden rounded-2xl border border-gold/25 shadow-card backdrop-blur-md md:inset-x-auto md:bottom-4 md:left-4 md:top-4 md:max-h-none md:w-[340px]"
      style={{ background: "rgba(27,14,9,0.92)" }}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-cream/10 px-4 py-3">
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight text-cream">{m.vinos.nations[pais]}</p>
          <p className="mt-0.5 font-caps text-[10px] uppercase tracking-[0.2em] text-gold/80">
            {[
              total === 1 ? m.vinos.mapWorldOneWine : t(m.vinos.mapWorldWines, { count: total }),
              grupos.length === 1 ? m.vinos.mapWorldOneOrigin : t(m.vinos.mapWorldOrigins, { count: grupos.length }),
            ].join(" · ")}
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label={m.vinos.close}
          className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
        {grupos.map(({ origin, vinos }) => (
          <div key={origin} className="mb-4 last:mb-0">
            <p className="font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">{nombreDeOrigen(origin, m)}</p>
            <ul className="mt-2 grid gap-1.5">
              {vinos.map((vino) => (
                <li key={vino.id}>
                  <button
                    type="button"
                    onClick={() => onVino(vino)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-cream/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  >
                    <span className="relative block h-12 w-9 shrink-0 overflow-hidden rounded-md bg-black/40">
                      {vino.image ? (
                        <Image src={vino.image} alt="" fill sizes="36px" quality={60} className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-cream/20">
                          <WineIcon className="h-4 w-4" strokeWidth={1.25} aria-hidden />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[15px] leading-snug text-cream">{vino.name}</span>
                      {/* Bodega y uva: lo que pidió el cliente que se viera sin abrir la ficha. Lo que
                          no conste en los datos no se escribe — ni "variedad desconocida" ni nada. */}
                      <span className="block truncate text-[12px] leading-snug text-cream-faint">
                        {[vino.winery && !vino.name.startsWith(vino.winery) ? vino.winery : null, vino.grapes?.join(" · ")]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    {SHOW_WINE_PRICES && vino.bottlePrice !== undefined ? (
                      <span className="shrink-0 font-sans text-[13px] font-semibold text-gold">{formatPrice(vino.bottlePrice, locale)}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
