"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus, RotateCcw, Wine as WineIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import VinoSpotlight, { nombreDeOrigen } from "@/components/vinos/VinoSpotlight";
import { MUNDO_PAISES, MUNDO_VIEWBOX, proyectar } from "@/data/geo/mundo";
import { formatPrice } from "@/data/menu";
import { NATION_IDS, NATIONS, ORIGIN_NATION, ORIGIN_ORDER, winesByOrigin, type NationId, type Wine, type WineOrigin } from "@/data/wines";
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
  fondoClaro: "#3D2415",
  tierra: "#4A2E1D",
  tierraActiva: "#6B4428",
  borde: "rgba(246,244,231,0.22)",
  bordeActivo: "rgba(240,208,128,0.85)",
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

  /** Siluetas a resaltar: las de los países con vino. Se cruza por el nombre de Natural Earth. */
  const resaltados = useMemo(() => new Set(naciones.map((id) => NATIONS[id].naturalEarth)), [naciones]);

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

  const alBajarPuntero = (e: ReactPointerEvent<SVGSVGElement>) => {
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    arrastrado.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
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
      return;
    }

    const escala = porPixel();
    const dx = (e.clientX - anterior.x) * escala;
    const dy = (e.clientY - anterior.y) * escala;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) arrastrado.current = true;
    setEncuadre((enc) => encajar({ ...enc, x: enc.x + dx, y: enc.y + dy }));
  };

  const alSoltarPuntero = (e: ReactPointerEvent<SVGSVGElement>) => {
    punteros.current.delete(e.pointerId);
    if (punteros.current.size < 2) pellizco.current = null;
  };

  const alRodar = (e: ReactWheelEvent<SVGSVGElement>) => {
    /* Sin `preventDefault`: el oyente de React es pasivo y el navegador lo ignoraría con un aviso en
       la consola. El `touch-action: none` del SVG ya impide que la página se desplace con el dedo, y
       con rueda de ratón ampliar sin bloquear el desplazamiento de la página es lo que espera la
       gente — un mapa que secuestra la rueda es de las cosas más molestas que hay en una web. */
    if (!e.ctrlKey && Math.abs(e.deltaY) < 8) return;
    const { px, py } = aLienzo(e.clientX, e.clientY);
    setEncuadre((enc) => ampliarEn(enc, e.deltaY < 0 ? 1.18 : 1 / 1.18, px, py));
  };

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
      <p className="font-caps text-xs uppercase tracking-[0.3em] text-pimenton-a11y">{m.vinos.mapWorldKicker}</p>
      <h2 id={tituloId} className="mt-3 max-w-2xl font-display text-3xl font-medium leading-[1.02] text-cream text-balance md:text-4xl">
        {m.vinos.mapWorldTitle}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream-muted text-pretty md:text-base">
        {t(m.vinos.mapWorldLead, { count: totalVinos, countries: naciones.length })}
      </p>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-cream/10 shadow-card" style={{ background: COLOR.fondo }}>
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
          onWheel={alRodar}
        >
          <defs>
            <radialGradient id="mapa-brillo" cx="50%" cy="42%" r="62%">
              <stop offset="0%" stopColor={COLOR.fondoClaro} />
              <stop offset="100%" stopColor={COLOR.fondo} />
            </radialGradient>
            <radialGradient id="mapa-chincheta" cx="38%" cy="32%" r="70%">
              <stop offset="0%" stopColor={COLOR.chinchetaClara} />
              <stop offset="100%" stopColor={COLOR.chinchetaOscura} />
            </radialGradient>
          </defs>

          <rect width={MUNDO_VIEWBOX.width} height={MUNDO_VIEWBOX.height} fill="url(#mapa-brillo)" />

          <g transform={`translate(${encuadre.x} ${encuadre.y}) scale(${encuadre.k})`}>
            {/* Los 176 contornos. `vectorEffect` mantiene el borde a 0,6 px aunque se amplíe siete
                veces: sin eso, al acercarse las fronteras se convierten en morcillas. */}
            <g strokeLinejoin="round">
              {MUNDO_PAISES.map((pais) => {
                const activo = resaltados.has(pais.name);
                return (
                  <path
                    key={pais.id}
                    d={pais.d}
                    fill={activo ? COLOR.tierraActiva : COLOR.tierra}
                    stroke={activo ? COLOR.bordeActivo : COLOR.borde}
                    strokeWidth={activo ? 1.1 : 0.6}
                    vectorEffect="non-scaling-stroke"
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
                    etiqueta={t(m.vinos.mapWorldPin, { country: m.vinos.nations[id], count: cuantos })}
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
      <ul className="mt-4 flex flex-wrap gap-2">
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
            {t(m.vinos.mapWorldCardCount, { count: total, origins: grupos.length })}
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
                    {vino.bottlePrice !== undefined ? (
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
