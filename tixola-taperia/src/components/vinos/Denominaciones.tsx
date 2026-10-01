"use client";

import { useId } from "react";
import { MapPin } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { OURENSE_ON_MAP, WINE_REGION_LIST, type GalicianDoId, type WineRegion } from "@/data/wines";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * LAS CINCO DENOMINACIONES DE GALICIA — mapa esquemático y fichas.
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
 * EL MAPA NO ES UN DIBUJO DE GALICIA. No se traza una silueta de la comunidad porque una silueta
 * aproximada es una silueta equivocada, y aquí no hay forma de verificarla. Lo que sí está
 * verificado es DÓNDE CAE CADA ZONA: las posiciones salen de la longitud y la latitud reales de la
 * sede de cada consejo regulador, proyectadas sobre el encuadre (ver `map` en `wines.ts`). El
 * Atlántico a la izquierda y Portugal abajo son las dos referencias que hacen falta para leerlo.
 *
 * Las chapas son ENLACES a la ficha de abajo (`#do-…`), no botones con estado: el navegador ya sabe
 * llevar a un ancla, y así funciona también sin JavaScript.
 */

/**
 * Proporción de la caja del mapa: la MISMA que el encuadre geográfico del que salen las
 * coordenadas (202 × 78 km ≈ 2,6:1, ver `map` en `wines.ts`). Si se cambia una sin la otra, las
 * distancias entre denominaciones dejan de ser las reales.
 */
const MAPA_RATIO = "aspect-[2.6/1]";

/**
 * Qué chapas llevan el nombre ENCIMA del punto en vez de debajo. Por defecto va debajo, que se lee
 * mejor; estas dos son excepciones medidas, no gusto:
 *  · Monterrei está casi pegada al borde sur, y debajo se le saldría del mapa.
 *  · Ribeira Sacra tiene a Ourense justo debajo a la izquierda; con los dos nombres abajo se tocaban
 *    a 768 px (comprobado). Subiéndola, se separan en todos los anchos.
 */
const ETIQUETA_ARRIBA: Partial<Record<GalicianDoId, boolean>> = { monterrei: true, "ribeira-sacra": true };

export default function Denominaciones() {
  const m = useMessages();
  const tituloId = useId();

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

      <Mapa />

      {/* La aclaración que impide leer el mapa como si fuera la carta. Visible, no en letra pequeña. */}
      <p className="mt-5 max-w-2xl border-l-2 border-pimenton-light/40 pl-4 text-sm leading-relaxed text-cream-faint">
        {m.vinos.regionsNote}
      </p>

      <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {WINE_REGION_LIST.map((region) => (
          <FichaDenominacion key={region.id} region={region} />
        ))}
      </ul>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   El mapa
   ────────────────────────────────────────────────────────────── */

function Mapa() {
  const m = useMessages();

  return (
    <figure /* EL MAPA NO SE PINTA EN EL TELÉFONO, y no es por pereza. Por debajo de 1024 px la caja se queda tan baja que
          las cinco chapas se pisan entre ellas y con el rótulo del Atlántico: medido a 390 y a 768, no
          supuesto. Comprimir el mapa para que quepan sería mentir sobre dónde está cada zona, que es
          lo único que el mapa aporta. Las fichas de abajo llevan TODOS los datos y se leen muy bien en
          vertical, así que en el móvil no se pierde información: se pierde un adorno que allí no
          funciona. */
      className={cn("relative mt-10 hidden w-full overflow-hidden rounded-3xl border border-cream/12 bg-granate-900/60 lg:block", MAPA_RATIO)}>
      {/* Lavado del Atlántico por el borde oeste y rescoldo tierra adentro: las dos referencias que
          orientan el mapa sin dibujar una costa que no se puede verificar. */}
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,48,66,0.55)_0%,rgba(28,48,66,0.18)_14%,transparent_30%)]" />
      <span aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_52%_60%_at_58%_42%,rgba(172,32,34,0.3)_0%,transparent_72%)]" />
      {/* Frontera con Portugal: una línea discontinua al sur, que es lo que ancla Monterrei. */}
      <span aria-hidden className="absolute inset-x-0 bottom-[7%] h-px bg-[repeating-linear-gradient(90deg,rgba(246,244,231,0.3)_0_10px,transparent_10px_20px)]" />

      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-caps text-[10px] uppercase tracking-[0.3em] text-cream-faint [writing-mode:vertical-rl] md:left-5 md:text-[11px]">
        {m.vinos.mapAtlantic}
      </span>
      <span className="absolute bottom-[2%] left-1/2 -translate-x-1/2 font-caps text-[10px] uppercase tracking-[0.3em] text-cream-faint md:text-[11px]">
        {m.vinos.mapPortugal}
      </span>

      {/* Ourense: el punto desde el que se mira todo lo demás. */}
      <span
        data-chapa="ourense"
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
        style={{ left: `${OURENSE_ON_MAP.x}%`, top: `${OURENSE_ON_MAP.y}%` }}
      >
        <MapPin size={18} aria-hidden className="text-pimenton-light drop-shadow-[0_0_8px_rgba(232,86,90,0.8)]" />
        <span className="whitespace-nowrap text-center font-caps text-[10px] uppercase leading-tight tracking-[0.22em] text-cream md:text-[11px]">
          {BUSINESS.address.city}
          <span className="block text-[8px] tracking-[0.18em] text-pimenton-a11y md:text-[9px]">{m.vinos.mapHere}</span>
        </span>
      </span>

      {WINE_REGION_LIST.map((region) => (
        <Chapa key={region.id} region={region} />
      ))}

      <figcaption className="sr-only">{m.vinos.mapAria}</figcaption>
    </figure>
  );
}

/** Una denominación sobre el mapa: punto del color de su vino dominante y nombre. */
function Chapa({ region }: { region: WineRegion }) {
  const m = useMessages();
  const t = useFormat();
  const arriba = ETIQUETA_ARRIBA[region.id] ?? false;

  return (
    <a
      href={`#do-${region.id}`}
      data-chapa={region.id}
      aria-label={t(m.vinos.regionAria, { name: region.label })}
      className={cn(
        "group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-lg px-1.5 py-1",
        "outline-none transition-transform duration-300 ease-[var(--ease-out-expo)] hover:scale-110 focus-visible:ring-2 focus-visible:ring-cream",
        arriba && "flex-col-reverse",
      )}
      style={{ left: `${region.map.x}%`, top: `${region.map.y}%` }}
    >
      <span
        aria-hidden
        className={cn(
          "h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-granate-900/70 transition-shadow",
          region.mostly === "tinto"
            ? "bg-pimenton-light shadow-[0_0_10px_rgba(232,86,90,0.9)]"
            : "bg-gold shadow-[0_0_10px_rgba(232,194,122,0.9)]",
        )}
      />
      <span className="whitespace-nowrap font-caps text-[10px] uppercase tracking-[0.18em] text-cream-muted transition-colors group-hover:text-cream md:text-[12px]">
        {region.label}
      </span>
    </a>
  );
}

/* ──────────────────────────────────────────────────────────────
   Las fichas
   ────────────────────────────────────────────────────────────── */

function FichaDenominacion({ region }: { region: WineRegion }) {
  const m = useMessages();
  const t = useFormat();

  return (
    <li
      id={`do-${region.id}`}
      className="noise after:noise-after relative scroll-mt-28 overflow-hidden rounded-2xl border border-cream/12 bg-granate-800/50 p-5 md:p-6"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-display text-2xl font-medium text-cream md:text-[1.7rem]">
          <span className="font-caps text-sm tracking-[0.12em] text-cream-faint">{m.vinos.doPrefix}</span> {region.label}
        </h3>
        {region.since ? (
          <span className="font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">
            {t(m.vinos.since, { year: region.since })}
          </span>
        ) : null}
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-cream-faint">
        {/* Separador neutro: así no hay que traducir ninguna conjunción. */}
        <span>{region.provinces.join(" · ")}</span>
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

      <p className="mt-4 text-sm leading-relaxed text-cream-muted">{m.vinos.regionCharacter[region.id]}</p>

      <dl className="mt-5 grid gap-3 text-sm">
        <Uvas titulo={m.vinos.whites} lista={region.whites} tono="blanco" />
        <Uvas titulo={m.vinos.reds} lista={region.reds} tono="tinto" />
      </dl>
    </li>
  );
}

/** Una lista de variedades. Los nombres de uva no se traducen: son nombres propios de variedad. */
function Uvas({ titulo, lista, tono }: { titulo: string; lista: readonly string[]; tono: "blanco" | "tinto" }) {
  return (
    <div className="grid gap-1.5">
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
