"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Plus } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";
import { DENOMINACIONES, DOS_PUERTAS_ON_MAP, DO_IDS, type Denominacion, type DoId } from "@/data/denominaciones";
import { GALICIA_OUTLINE, GALICIA_RATIO } from "@/data/geo/galicia";
import { cn } from "@/lib/cn";

/**
 * Las cinco denominaciones: mapa real de Galicia (contorno de OpenStreetMap, posiciones reales) con
 * el vino viajando de cada zona a la rúa dos Fornos, y al lado fichas desplegables de una en una.
 * Mismo patrón que la web de Tixola. El contenido de las cinco va SIEMPRE en el HTML (plegado, no
 * desmontado): lo leen los buscadores y lo encuentra el Ctrl+F.
 */
type Lado = "arriba" | "abajo" | "izquierda" | "derecha";
const ETIQUETA: Record<DoId, Lado> = {
  "rias-baixas": "abajo",
  ribeiro: "izquierda",
  "ribeira-sacra": "arriba",
  valdeorras: "izquierda",
  monterrei: "arriba",
};
const TINTO = "#e07b8a";
const ORO = "#e3c46a";

function camino(desde: { x: number; y: number }, hasta: { x: number; y: number }) {
  const dx = hasta.x - desde.x;
  const dy = hasta.y - desde.y;
  const cx = (desde.x + hasta.x) / 2 - dy * 0.15;
  const cy = (desde.y + hasta.y) / 2 + dx * 0.15;
  return `M${desde.x} ${desde.y} Q${cx.toFixed(2)} ${cy.toFixed(2)} ${hasta.x} ${hasta.y}`;
}

function Mapa() {
  const m = useMessages();
  const t = m.vinos;
  const gid = useId().replace(/:/g, "");
  return (
    <figure className={cn("relative w-full overflow-hidden rounded-3xl border border-cream/12 bg-botella-900/70", GALICIA_RATIO)}>
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(105deg,rgba(24,52,64,0.55)_0%,rgba(24,52,64,0.2)_18%,transparent_42%)]" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`tierra-${gid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#2c4a3b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0f1d17" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <path d={GALICIA_OUTLINE} fill={`url(#tierra-${gid})`} stroke="rgba(243,236,220,0.42)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {DENOMINACIONES.map((d, i) => {
          const path = camino(d.map, DOS_PUERTAS_ON_MAP);
          return (
            <g key={d.id}>
              <path d={path} fill="none" stroke="rgba(243,236,220,0.16)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <path
                data-flujo
                d={path}
                pathLength={100}
                fill="none"
                stroke={d.mostly === "tinto" ? TINTO : ORO}
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ "--flujo-delay": `${(i * 0.5).toFixed(1)}s` } as CSSProperties}
              />
            </g>
          );
        })}
      </svg>
      <span className="absolute top-[8%] left-[7%] font-caps text-[9px] tracking-[0.3em] text-cream-faint uppercase md:text-[10px]">{t.mapAtlantic}</span>
      <span className="absolute bottom-[1.5%] left-[30%] font-caps text-[9px] tracking-[0.3em] text-cream-faint/80 uppercase md:text-[10px]">{t.mapPortugal}</span>
      {DENOMINACIONES.map((d, i) => (
        <Chapa key={d.id} d={d} numero={i + 1} />
      ))}
      {/* El Dos Puertas: el punto al que llegan los cinco caminos. */}
      <span
        className="absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        style={{ left: `${DOS_PUERTAS_ON_MAP.x}%`, top: `${DOS_PUERTAS_ON_MAP.y}%` }}
      >
        <span data-latido aria-hidden className="absolute inset-0 rounded-full border border-oro/70 opacity-0" />
        <MapPin size={18} aria-hidden className="relative text-oro drop-shadow-[0_0_8px_rgba(227,196,106,0.9)]" />
        <span className="absolute left-full ml-1 font-caps text-[9px] leading-tight tracking-[0.14em] whitespace-nowrap text-cream uppercase sm:text-[10px] md:text-[11px]">
          Dos Puertas
          <span className="block text-[7px] tracking-[0.1em] text-oro-a11y sm:text-[8px] md:text-[9px]">{t.mapHere}</span>
        </span>
      </span>
      <figcaption className="sr-only">
        {t.mapAria} {t.mapFlow}
      </figcaption>
    </figure>
  );
}

function Chapa({ d, numero }: { d: Denominacion; numero: number }) {
  const m = useMessages();
  const lado = ETIQUETA[d.id];
  return (
    <a
      href={`#do-${d.id}`}
      aria-label={format(m.vinos.regionAria, { name: d.label })}
      className={cn(
        "group absolute flex size-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-caps text-[10px] leading-none ring-2 ring-botella-900/80 outline-none",
        "transition-transform duration-300 hover:scale-125 focus-visible:scale-125 focus-visible:ring-cream",
        d.mostly === "tinto" ? "bg-[#e07b8a] text-botella-900 shadow-[0_0_10px_rgba(224,123,138,0.85)]" : "bg-oro text-botella-900 shadow-[0_0_10px_rgba(227,196,106,0.85)]",
      )}
      style={{ left: `${d.map.x}%`, top: `${d.map.y}%` }}
    >
      {numero}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute z-10 rounded-md bg-botella-900/95 px-2 py-1 font-caps text-[10px] tracking-[0.14em] whitespace-nowrap text-cream uppercase opacity-0 shadow-lg ring-1 ring-cream/15",
          "transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
          lado === "arriba" && "bottom-full left-1/2 mb-1.5 -translate-x-1/2",
          lado === "abajo" && "top-full left-1/2 mt-1.5 -translate-x-1/2",
          lado === "izquierda" && "right-full mr-1.5",
          lado === "derecha" && "left-full ml-1.5",
        )}
      >
        {d.label}
      </span>
    </a>
  );
}

function Uvas({ titulo, lista, tono }: { titulo: string; lista: readonly string[]; tono: "blanco" | "tinto" }) {
  return (
    <div className="grid content-start gap-1.5">
      <dt className="font-caps text-[10px] tracking-[0.22em] text-cream-faint uppercase">{titulo}</dt>
      <dd className="flex flex-wrap gap-1.5">
        {lista.map((uva, i) => (
          <span
            key={uva}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[12px] leading-none",
              i === 0
                ? tono === "tinto"
                  ? "border-[#e07b8a]/50 bg-[#e07b8a]/15 text-cream"
                  : "border-oro/45 bg-oro/12 text-cream"
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

function Ficha({ d, numero, abierta, onAlternar }: { d: Denominacion; numero: number; abierta: boolean; onAlternar: () => void }) {
  const m = useMessages();
  const t = m.vinos;
  const reducido = useReducedMotion();
  const panelId = useId();
  const it = t.items[d.id];
  return (
    <li id={`do-${d.id}`} className="scroll-mt-28">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border transition-colors duration-300",
          abierta ? "border-oro/30 bg-botella-700/70" : "border-cream/10 bg-botella-800/60 hover:border-cream/25",
        )}
      >
        <button type="button" onClick={onAlternar} aria-expanded={abierta} aria-controls={panelId} className="flex w-full items-center gap-3 px-4 py-3.5 text-left md:px-5">
          <span
            aria-hidden
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full font-caps text-[11px] leading-none text-botella-900",
              d.mostly === "tinto" ? "bg-[#e07b8a]" : "bg-oro",
            )}
          >
            {numero}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl leading-tight font-medium text-cream md:text-2xl">
              <span className="font-caps text-xs tracking-[0.12em] text-cream-faint">{t.doPrefix}</span> {d.label}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-cream-faint">
              {d.provinces.join(" · ")}
              {d.since ? ` · ${format(t.since, { year: d.since })}` : ""}
            </span>
          </span>
          <Plus aria-hidden className={cn("size-5 shrink-0 text-oro-a11y transition-transform duration-300", abierta && "rotate-45")} strokeWidth={2} />
        </button>
        <motion.div
          id={panelId}
          initial={false}
          animate={abierta ? "abierta" : "cerrada"}
          variants={{ abierta: { height: "auto", visibility: "visible" }, cerrada: { height: 0, transitionEnd: { visibility: "hidden" } } }}
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
              {d.ourense ? (
                <span className="rounded-full border border-oro/40 px-2 py-0.5 font-caps text-[9px] tracking-[0.18em] text-oro-a11y uppercase">{t.ourenseBadge}</span>
              ) : null}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-caps text-[9px] tracking-[0.18em] uppercase",
                  d.mostly === "tinto" ? "bg-[#e07b8a]/15 text-[#f0a3ae]" : "bg-oro/15 text-oro-a11y",
                )}
              >
                {t.mostly[d.mostly]}
              </span>
            </p>
            <p className="mt-3 text-[13px] text-cream-faint">{it.zone}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-cream-muted">{it.text}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Uvas titulo={t.whites} lista={d.blancas} tono="blanco" />
              <Uvas titulo={t.reds} lista={d.tintas} tono="tinto" />
            </dl>
          </motion.div>
        </motion.div>
      </div>
    </li>
  );
}

export default function Denominaciones() {
  const m = useMessages();
  const [abierta, setAbierta] = useState<DoId | null>("ribeiro");

  /* Pinchar un número del mapa lleva a su ficha (#do-…) y además la abre. */
  useEffect(() => {
    const abrir = () => {
      const id = window.location.hash.slice(1);
      if (!id.startsWith("do-")) return;
      const region = id.slice(3);
      if ((DO_IDS as readonly string[]).includes(region)) setAbierta(region as DoId);
    };
    window.addEventListener("hashchange", abrir);
    return () => window.removeEventListener("hashchange", abrir);
  }, []);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-12">
      <div className="lg:sticky lg:top-28">
        <Mapa />
        <p className="mt-3 text-[11px] leading-relaxed text-cream-faint/80">{m.vinos.mapCredit}</p>
      </div>
      <div>
        <ol className="grid gap-3">
          {DENOMINACIONES.map((d, i) => (
            <Ficha key={d.id} d={d} numero={i + 1} abierta={abierta === d.id} onAlternar={() => setAbierta((p) => (p === d.id ? null : d.id))} />
          ))}
        </ol>
        <p className="mt-6 border-l-2 border-oro/40 pl-4 text-sm leading-relaxed text-cream-faint">{m.vinos.doNote}</p>
      </div>
    </div>
  );
}
