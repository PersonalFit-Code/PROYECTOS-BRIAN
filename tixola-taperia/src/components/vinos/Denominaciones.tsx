"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Plus } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { GALICIA_OUTLINE, GALICIA_RATIO } from "@/data/geo/galicia";
import { GALICIAN_DO_IDS, OURENSE_ON_MAP, wineCountByOrigin, WINE_REGION_LIST, type GalicianDoId, type WineRegion } from "@/data/wines";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * LAS CINCO DENOMINACIONES DE GALICIA — mapa con el vino viniendo hacia aquí, y fichas desplegables.
 *
 * POR QUÉ ESTO ESTÁ EN LA PÁGINA. La carta de vinos todavía no existe, y una página que solo dijera
 * "próximamente" no merece una visita. Esto sí: es información verdadera, contrastada contra el
 * pliego de condiciones de cada denominación, y es justo lo que el cliente pidió para quien no
 * entiende de vino — poder enterarse de qué se está tomando.
 *
 * LO QUE NO ES. No es la carta. Por eso la nota de `m.vinos.regionsNote` va VISIBLE y no en letra
 * pequeña: el mapa enseña de dónde sale el vino gallego, no de dónde sale el de esta casa, y
 * confundir las dos cosas sería volver a prometer botellas que no hay.
 *
 * EL MAPA SÍ ES GALICIA, Y ES UN DATO. La silueta no está dibujada a mano: es el contorno
 * administrativo de OpenStreetMap (`src/data/geo/galicia.ts`), y las seis posiciones son longitudes
 * y latitudes reales proyectadas sobre el mismo encuadre, así que cada denominación cae dentro de la
 * silueta donde cae de verdad. Esa es la razón por la que antes aquí no había mapa de Galicia: una
 * silueta aproximada es una silueta equivocada. La licencia ODbL EXIGE atribución visible, y la pinta
 * `m.vinos.mapCredit` debajo del mapa: no quitarla sin cambiar de fuente.
 *
 * LOS CINCO CAMINOS son la idea del cliente: cada denominación en su sitio, y el vino fluyendo desde
 * todas ellas hasta Ourense, al local. No es adorno gratuito, es el argumento de la página en una
 * imagen —"el vino de aquí se hace al lado"—. El movimiento vive en `globals.css` (`[data-flujo]`),
 * dentro de `prefers-reduced-motion: no-preference`: quien pide menos movimiento ve los cinco
 * caminos enteros y quietos, que cuentan lo mismo.
 *
 * POR QUÉ FICHAS DESPLEGABLES Y NO UNA REJILLA. Cinco tarjetas en una rejilla de tres columnas dejan
 * una fila de tres y otra de dos, y ese hueco se ve. Cinco filas desplegables en una columna al lado
 * del mapa no tienen hueco posible, caben en una pantalla y, abriéndose de una en una, la lista
 * nunca crece por debajo del mapa. El contenido de las cinco va SIEMPRE en el HTML —plegado a altura
 * cero, no desmontado—, que es lo que leen los buscadores y lo que encuentra el Ctrl+F.
 */

type Lado = "arriba" | "abajo" | "izquierda" | "derecha";

/**
 * EN EL MAPA NO HAY NOMBRES, HAY NÚMEROS, y es una decisión medida: con las posiciones reales, el
 * punto del Ribeiro cae a diez unidades del local —la ciudad de Ourense está DENTRO de su zona de
 * producción—, que a cualquier ancho son menos píxeles de los que ocupa una sola de las dos palabras.
 * Cinco nombres sobre el mapa se pisaban entre ellos en los cuatro idiomas y en los seis anchos
 * probados. Mover los puntos para que quepan sería mentir sobre dónde está cada zona, que es lo único
 * que el mapa aporta; así que el nombre vive en la ficha, el número empareja las dos cosas, y el mapa
 * se queda legible hasta en 320 px.
 *
 * El nombre SÍ aparece al pasar por encima o al llegar con el teclado, en un globo flotante que no
 * ocupa sitio en reposo. Este registro dice hacia qué lado se abre para que no se salga del mapa:
 * Valdeorras es el punto más oriental y Monterrei casi toca el borde sur.
 */
const ETIQUETA: Record<GalicianDoId, Lado> = {
  "rias-baixas": "abajo",
  ribeiro: "izquierda",
  "ribeira-sacra": "arriba",
  valdeorras: "izquierda",
  monterrei: "arriba",
};

/** Curvatura de los caminos, en proporción a su largo. Suficiente para que se vean cinco trazos y no cinco radios. */
const CURVATURA = 0.15;

/** Un camino de ida: de la denominación al local, curvado siempre hacia el mismo lado. */
function camino(desde: { x: number; y: number }, hasta: { x: number; y: number }) {
  const dx = hasta.x - desde.x;
  const dy = hasta.y - desde.y;
  /* Perpendicular al segmento (girada siempre en el mismo sentido): los cinco caminos se arquean
     igual y el conjunto se lee como un remolino hacia el centro, no como cinco líneas sueltas. */
  const cx = (desde.x + hasta.x) / 2 - dy * CURVATURA;
  const cy = (desde.y + hasta.y) / 2 + dx * CURVATURA;
  return `M${desde.x} ${desde.y} Q${cx.toFixed(2)} ${cy.toFixed(2)} ${hasta.x} ${hasta.y}`;
}

/** Color del vino dominante de la zona: dorado para blanco, pimentón para tinto. */
function tono(region: WineRegion) {
  return region.mostly === "tinto" ? "var(--color-pimenton-light)" : "var(--color-gold)";
}

export default function Denominaciones() {
  const m = useMessages();
  const tituloId = useId();

  /**
   * QUÉ FICHA ESTÁ ABIERTA. Solo una: es un acordeón, y las cinco abiertas a la vez dejarían el mapa
   * de al lado flotando sobre metro y medio de texto.
   *
   * Antes esto no era estado de React sino `<details name="denominacion">`, el acordeón que trae el
   * propio HTML. Funcionaba y no costaba nada, pero `<details>` abre de golpe: no hay forma de
   * animar la apertura, porque el navegador pasa el contenido de `display:none` a visible en un
   * fotograma. El cliente pidió animarlo ("métele animaciones a esto al desplegarlo"), así que la
   * apertura pasa a ser estado y la altura la anima framer.
   *
   * El contenido de las cinco sigue estando SIEMPRE en el HTML, plegado a altura cero, y no se monta
   * y desmonta: así sigue saliendo en el buscador del navegador y leyéndolo un rastreador, que es la
   * mitad del valor de esta sección.
   */
  const [abierta, setAbierta] = useState<GalicianDoId | null>(null);

  /**
   * Las chapas del mapa son enlaces a `#do-…`: el navegador ya lleva a la ficha, que es lo
   * importante. Aquí además se abre, porque llegar a una ficha cerrada después de pinchar en el mapa
   * es llegar a medias.
   */
  useEffect(() => {
    const abrirLaDelAncla = () => {
      const id = window.location.hash.slice(1);
      if (!id.startsWith("do-")) return;
      const region = id.slice(3);
      if (GALICIAN_DO_IDS.includes(region as GalicianDoId)) setAbierta(region as GalicianDoId);
    };
    abrirLaDelAncla();
    window.addEventListener("hashchange", abrirLaDelAncla);
    return () => window.removeEventListener("hashchange", abrirLaDelAncla);
  }, []);

  return (
    <section aria-labelledby={tituloId} className="container-page pb-16 md:pb-24">
      <p className="inline-flex items-center gap-3 font-caps text-xs uppercase tracking-[0.3em] text-pimenton-a11y">
        <span aria-hidden className="h-px w-8 bg-pimenton-light/70" />
        {m.vinos.regionsKicker}
      </p>
      <h2 id={tituloId} className="mt-4 font-display text-4xl font-medium leading-[0.98] text-cream text-balance md:text-5xl">
        {m.vinos.regionsTitle} <em className="text-gradient-ember font-light italic">{m.vinos.regionsAccent}</em>
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-muted text-pretty">{m.vinos.regionsLead}</p>

      {/* Mapa a la izquierda, fichas a la derecha. El mapa se queda quieto mientras se recorren las
          cinco fichas: así el nombre que abres y su sitio en Galicia se ven a la vez. */}
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-12">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <Mapa />
          {/* Atribución obligatoria del contorno (ODbL). No es letra pequeña opcional: es la licencia. */}
          <p className="mt-3 text-[11px] leading-relaxed text-cream-faint/80">{m.vinos.mapCredit}</p>
        </div>

        <div>
          <ol className="grid gap-3">
            {WINE_REGION_LIST.map((region, i) => (
              <FichaDenominacion
                key={region.id}
                region={region}
                numero={i + 1}
                abierta={abierta === region.id}
                onAlternar={() => setAbierta((previa) => (previa === region.id ? null : region.id))}
              />
            ))}
          </ol>

          {/* La aclaración que impide leer el mapa como si fuera la carta. Visible, no en letra pequeña. */}
          <p className="mt-6 border-l-2 border-pimenton-light/40 pl-4 text-sm leading-relaxed text-cream-faint">
            {m.vinos.regionsNote}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   El mapa
   ────────────────────────────────────────────────────────────── */

function Mapa() {
  const m = useMessages();
  const gradienteId = useId();
  const tierra = `tierra-${gradienteId.replace(/:/g, "")}`;

  return (
    <figure className={cn("relative w-full overflow-hidden rounded-3xl border border-cream/12 bg-granate-900/70", GALICIA_RATIO)}>
      {/* El Atlántico lavando el borde oeste: la referencia que orienta el mapa de un vistazo. */}
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(105deg,rgba(28,48,66,0.6)_0%,rgba(28,48,66,0.22)_18%,transparent_42%)]" />

      {/*
        `preserveAspectRatio="none"` es deliberado: el contorno y las seis posiciones ya vienen en 0-100
        del lienzo, así que estirar el lienzo a la caja es exactamente lo correcto. La caja usa la
        proporción real del encuadre (`GALICIA_RATIO`), con lo que el estirón es del 3 % y no se ve; y
        los trazos llevan `vector-effect` para que ni ese 3 % les cambie el grosor.
      */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={tierra} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#5f3327" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2a0f0d" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <path
          d={GALICIA_OUTLINE}
          fill={`url(#${tierra})`}
          stroke="rgba(246,244,231,0.42)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        {WINE_REGION_LIST.map((region, i) => {
          const d = camino(region.map, OURENSE_ON_MAP);
          return (
            <g key={region.id}>
              {/* El camino quieto: siempre visible, también sin animación. */}
              <path d={d} fill="none" stroke="rgba(246,244,231,0.16)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              {/* El vino que viaja por él. La discontinuidad la pone `globals.css`. */}
              <path
                data-flujo
                d={d}
                pathLength={100}
                fill="none"
                stroke={tono(region)}
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ "--flujo-delay": `${(i * 0.5).toFixed(1)}s` } as CSSProperties}
              />
            </g>
          );
        })}
      </svg>

      <span className="absolute left-[7%] top-[8%] font-caps text-[9px] uppercase tracking-[0.3em] text-cream-faint md:text-[10px]">
        {m.vinos.mapAtlantic}
      </span>
      <span className="absolute bottom-[1.5%] left-[30%] font-caps text-[9px] uppercase tracking-[0.3em] text-cream-faint/80 md:text-[10px]">
        {m.vinos.mapPortugal}
      </span>

      {WINE_REGION_LIST.map((region, i) => (
        <Chapa key={region.id} region={region} numero={i + 1} />
      ))}

      <Local />

      <figcaption className="sr-only">
        {m.vinos.mapAria} {m.vinos.mapFlow}
      </figcaption>
    </figure>
  );
}

/** Tixola, el punto al que van los cinco caminos. */
function Local() {
  const m = useMessages();

  return (
    /*
      El contenedor es SOLO el alfiler, y el rótulo va `absolute` a su derecha. Si el rótulo contara
      para el ancho, el conjunto se centraría sobre el punto y el alfiler acabaría desplazado a la
      izquierda del sitio donde está Ourense de verdad —y pisando el punto del Ribeiro, que cae a diez
      unidades—. Así el alfiler marca el punto exacto y el rótulo cuelga de él.
    */
    <span
      data-chapa="ourense"
      className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      style={{ left: `${OURENSE_ON_MAP.x}%`, top: `${OURENSE_ON_MAP.y}%` }}
    >
      {/* El latido. Nace invisible: sin animación no se ve un anillo fijo encima del punto. */}
      <span data-latido aria-hidden className="absolute inset-0 rounded-full border border-pimenton-light/70 opacity-0" />
      <MapPin size={18} aria-hidden className="relative text-pimenton-light drop-shadow-[0_0_8px_rgba(232,86,90,0.9)]" />

      <span
        data-rotulo="ourense"
        /* Se encoge por debajo de 640 px: a 320 px el mapa mide 278 px y el rótulo entero llegaba a
           tocar el punto de Valdeorras, el más oriental de los cinco (medido, no supuesto). */
        className="absolute left-full ml-1 whitespace-nowrap font-caps text-[9px] uppercase leading-tight tracking-[0.14em] text-cream sm:text-[10px] sm:tracking-[0.18em] md:text-[11px]"
      >
        {BUSINESS.address.city}
        <span className="block text-[7px] tracking-[0.1em] text-pimenton-a11y sm:text-[8px] sm:tracking-[0.14em] md:text-[9px]">{m.vinos.mapHere}</span>
      </span>
    </span>
  );
}

/**
 * Una denominación sobre el mapa: su número y, al pasar por encima, su nombre. El número es el mismo
 * que lleva la ficha de abajo: es lo que empareja mapa y lista sin depender de que el nombre quepa.
 */
function Chapa({ region, numero }: { region: WineRegion; numero: number }) {
  const m = useMessages();
  const t = useFormat();
  const lado = ETIQUETA[region.id];

  return (
    <a
      href={`#do-${region.id}`}
      data-chapa={region.id}
      aria-label={t(m.vinos.regionAria, { name: region.label })}
      className={cn(
        "group absolute flex h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
        "font-caps text-[10px] leading-none ring-2 ring-granate-900/80 outline-none",
        "transition-transform duration-300 ease-[var(--ease-out-expo)] hover:scale-125 focus-visible:scale-125 focus-visible:ring-cream",
        region.mostly === "tinto"
          ? "bg-pimenton-light text-granate-900 shadow-[0_0_10px_rgba(232,86,90,0.85)]"
          : "bg-gold text-granate-900 shadow-[0_0_10px_rgba(232,194,122,0.85)]",
      )}
      style={{ left: `${region.map.x}%`, top: `${region.map.y}%` }}
    >
      {numero}
      {/* El globo flotante. `absolute` + `pointer-events-none`: en reposo no ocupa sitio, así que no
          hay dos nombres que puedan chocar, y tampoco tapa el punto de al lado al abrirse. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-granate-900/95 px-2 py-1",
          "font-caps text-[10px] uppercase tracking-[0.14em] text-cream opacity-0 shadow-lg ring-1 ring-cream/15",
          "transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
          lado === "arriba" && "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
          lado === "abajo" && "left-1/2 top-full mt-1.5 -translate-x-1/2",
          lado === "izquierda" && "right-full mr-1.5",
          lado === "derecha" && "left-full ml-1.5",
        )}
      >
        {region.label}
      </span>
    </a>
  );
}

/* ──────────────────────────────────────────────────────────────
   Las fichas
   ────────────────────────────────────────────────────────────── */

function FichaDenominacion({
  region,
  numero,
  abierta,
  onAlternar,
}: {
  region: WineRegion;
  numero: number;
  abierta: boolean;
  onAlternar: () => void;
}) {
  const m = useMessages();
  const t = useFormat();
  const reducido = useReducedMotion();
  const idPanel = useId();
  const enCarta = wineCountByOrigin(region.id);

  return (
    <li id={`do-${region.id}`} className="scroll-mt-28">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-granate-800/50 transition-colors duration-300",
          abierta ? "border-cream/20 bg-granate-800/70" : "border-cream/10 hover:border-cream/25",
        )}
      >
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={abierta}
          aria-controls={idPanel}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left md:px-5"
        >
          <span
            aria-hidden
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-caps text-[11px] leading-none",
              region.mostly === "tinto" ? "bg-pimenton-light/90 text-granate-900" : "bg-gold/90 text-granate-900",
            )}
          >
            {numero}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl font-medium leading-tight text-cream md:text-2xl">
              <span className="font-caps text-xs tracking-[0.12em] text-cream-faint">{m.vinos.doPrefix}</span> {region.label}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-cream-faint">
              {/* Separador neutro: así no hay que traducir ninguna conjunción. */}
              {region.provinces.join(" · ")}
              {region.since ? ` · ${t(m.vinos.since, { year: region.since })}` : ""}
            </span>
          </span>

          <Plus
            aria-hidden
            className={cn(
              "h-5 w-5 shrink-0 text-pimenton-a11y transition-transform duration-300 ease-[var(--ease-out-expo)]",
              abierta && "rotate-45",
            )}
            strokeWidth={2}
          />
        </button>

        {/*
          EL DESPLIEGUE. `height: auto` lo resuelve framer midiendo el contenido, así que la ficha
          crece hasta donde tenga que crecer sin número mágico ninguno. Van dos cosas a la vez y
          escalonadas a propósito: la altura abre la caja y, un pelín después, el contenido entra
          deslizándose desde arriba — si el texto apareciera del tirón al terminar la altura, la
          animación se vería en dos tiempos.

          `visibility` apaga el panel plegado para el teclado y los lectores de pantalla (altura cero
          sola no basta: el contenido seguiría siendo enfocable), pero el texto sigue en el HTML.

          Con `prefers-reduced-motion` no hay recorrido: se abre y se cierra, sin transición.
        */}
        <motion.div
          id={idPanel}
          initial={false}
          animate={abierta ? "abierta" : "cerrada"}
          variants={{
            abierta: { height: "auto", visibility: "visible" },
            cerrada: { height: 0, transitionEnd: { visibility: "hidden" } },
          }}
          transition={reducido ? { duration: 0 } : { duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <motion.div
            variants={{
              abierta: { opacity: 1, y: 0, transition: { duration: 0.34, delay: 0.08, ease: [0.16, 1, 0.3, 1] } },
              cerrada: { opacity: 0, y: -8, transition: { duration: 0.16 } },
            }}
            className="border-t border-cream/10 px-4 py-4 md:px-5"
          >
            <p className="flex flex-wrap items-center gap-2">
              {region.inOurense ? (
                <span className="rounded-full border border-pimenton-light/40 px-2 py-0.5 font-caps text-[9px] uppercase tracking-[0.18em] text-pimenton-a11y">
                  {m.vinos.inOurense}
                </span>
              ) : null}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-caps text-[9px] uppercase tracking-[0.18em]",
                  region.mostly === "tinto" ? "bg-pimenton/25 text-pimenton-a11y" : "bg-gold/15 text-gold",
                )}
              >
                {m.vinos.mostly[region.mostly]}
              </span>
            </p>

            <p className="mt-3 text-sm leading-relaxed text-cream-muted text-pretty">{m.vinos.regionCharacter[region.id]}</p>

            {/* El puente entre el mapa y la carta: cuántas botellas de esta zona hay abajo, y un
                enlace que lleva justo a ellas. Se calcula, no se escribe: si mañana cambia la carta,
                el número cambia solo. */}
            {enCarta > 0 ? (
              <a
                href={`#vinos-${region.id}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 font-caps text-[10px] uppercase tracking-[0.18em] text-gold transition-colors hover:border-gold/70 hover:bg-gold/20"
              >
                {t(m.vinos.inList, { count: enCarta })}
              </a>
            ) : null}

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Uvas titulo={m.vinos.whites} lista={region.whites} tono="blanco" />
              <Uvas titulo={m.vinos.reds} lista={region.reds} tono="tinto" />
            </dl>
          </motion.div>
        </motion.div>
      </div>
    </li>
  );
}

/** Una lista de variedades. Los nombres de uva no se traducen: son nombres propios de variedad. */
function Uvas({ titulo, lista, tono }: { titulo: string; lista: readonly string[]; tono: "blanco" | "tinto" }) {
  return (
    <div className="grid content-start gap-1.5">
      <dt className="font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">{titulo}</dt>
      <dd className="flex flex-wrap gap-1.5">
        {lista.map((uva, i) => (
          <span
            key={uva}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[12px] leading-none",
              /* La primera es la mayoritaria de la zona, y se destaca: es el dato que de verdad
                 responde a "¿y esto a qué sabe?". */
              i === 0
                ? tono === "tinto"
                  ? "border-pimenton-light/50 bg-pimenton/20 text-cream"
                  : "border-gold/45 bg-gold/12 text-cream"
                : "border-cream/15 text-cream-muted",
            )}
          >
            {uva}
          </span>
        ))}
      </dd>
    </div>
  );
}
