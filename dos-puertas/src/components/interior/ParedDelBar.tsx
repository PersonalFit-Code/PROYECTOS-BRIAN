"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { CARTELES } from "@/data/carteles";
import { cn } from "@/lib/cn";

/**
 * El interior del Dos Puertas, dibujado mientras llegan las fotos: pared blanca, copas colgadas
 * boca abajo sobre la barra, carteles negros y estanterías llenas de vino con una tira LED azul
 * marino (así lo describe Brian, que ha estado dentro). Todo es decorativo salvo el texto de los
 * carteles, que es texto de verdad.
 */

/* Generador fijo: el mismo surtido de botellas en el servidor y en el navegador. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const pick = <T,>(list: readonly T[], r: number) => list[Math.floor(r * list.length)];

type Forma = "burdeos" | "borgona" | "rin";
interface Botella {
  forma: Forma;
  vidrio: string;
  capsula: string;
  etiqueta: string;
  /* Una botella de vidrio claro deja ver el vino blanco. */
  claro: boolean;
}

const VIDRIOS = ["#1f3a2b", "#2c3a1b", "#4a2a12", "#2b1016", "#161616", "#1f3a2b"] as const;
const CAPSULAS = ["#c9a34a", "#7a1e2c", "#141414", "#e9e0cb", "#9a9a9a", "#c9a34a"] as const;
const ETIQUETAS = ["#f1ead8", "#f7f2e6", "#1c1c1c", "#e6d8b8"] as const;

function surtido(seed: number, n: number): Botella[] {
  const r = seeded(seed);
  return Array.from({ length: n }, () => {
    const forma = pick<Forma>(["burdeos", "burdeos", "borgona", "rin"], r());
    const claro = r() < 0.16;
    return { forma, claro, vidrio: claro ? "#cdbf7e" : pick(VIDRIOS, r()), capsula: pick(CAPSULAS, r()), etiqueta: pick(ETIQUETAS, r()) };
  });
}

/* Las tres siluetas, en una caja de 28 × 112 con el culo de todas abajo. */
const CUERPO: Record<Forma, string> = {
  burdeos: "M10.5 16H17.5V48Q17.5 53 24.5 56Q26.5 57 26.5 60V110Q26.5 112 24.5 112H3.5Q1.5 112 1.5 110V60Q1.5 57 3.5 56Q10.5 53 10.5 48Z",
  borgona: "M10.5 14H17.5V40C17.5 54 26.5 58 26.5 70V110Q26.5 112 24.5 112H3.5Q1.5 112 1.5 110V70C1.5 58 10.5 54 10.5 40Z",
  rin: "M11 2H17V38C17 54 23.5 60 23.5 72V110Q23.5 112 21.5 112H6.5Q4.5 112 4.5 110V72C4.5 60 11 54 11 38Z",
};
const CAPSULA: Record<Forma, [number, number, number, number]> = {
  burdeos: [10.2, 16, 7.6, 15],
  borgona: [10.2, 14, 7.6, 15],
  rin: [10.7, 2, 6.6, 17],
};
const ETIQUETA: Record<Forma, [number, number, number, number]> = {
  burdeos: [3, 72, 22, 22],
  borgona: [3, 80, 22, 20],
  rin: [6, 82, 16, 18],
};

function BotellaSvg({ b }: { b: Botella }) {
  const [cx, cy, cw, ch] = CAPSULA[b.forma];
  const [lx, ly, lw, lh] = ETIQUETA[b.forma];
  const oscura = b.etiqueta === "#1c1c1c";
  return (
    <svg viewBox="0 0 28 112" className="h-full w-auto shrink-0 overflow-visible">
      <path d={CUERPO[b.forma]} fill={b.vidrio} opacity={b.claro ? 0.85 : 1} />
      {/* El contraluz azul del LED en el borde y el brillo del vidrio. */}
      <path d={CUERPO[b.forma]} fill="url(#dp-vidrio)" stroke="#5d7dff" strokeOpacity={0.45} strokeWidth={0.8} />
      <rect x={cx} y={cy} width={cw} height={ch} rx={1} fill={b.capsula} />
      <rect x={lx} y={ly} width={lw} height={lh} rx={1.5} fill={b.etiqueta} />
      <rect x={lx + 3} y={ly + lh * 0.38} width={lw - 6} height={1.6} rx={0.8} fill={oscura ? "#c9a34a" : "#7a1e2c"} opacity={0.85} />
      <rect x={lx + 5} y={ly + lh * 0.62} width={lw - 10} height={1} rx={0.5} fill={oscura ? "#e9e0cb" : "#1c1c1c"} opacity={0.45} />
    </svg>
  );
}

/** Una balda blanca llena de botellas, con la tira LED azul marino debajo. */
export function Balda({ seed, className }: { seed: number; className?: string }) {
  const botellas = surtido(seed, 44);
  return (
    <div aria-hidden className={cn("relative", className)}>
      {/* El azul que sube por la pared desde el LED de debajo y recorta las botellas a contraluz. */}
      <div className="absolute inset-x-0 bottom-0 h-[115%] bg-[radial-gradient(70%_80%_at_50%_100%,rgba(38,70,205,0.34),rgba(38,70,205,0.08)_60%,transparent_80%)] [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]" />
      <div className="relative flex h-[76px] items-end justify-center gap-[5px] overflow-hidden px-2 sm:h-[96px] sm:gap-[7px]">
        {botellas.map((b, i) => (
          <BotellaSvg key={i} b={b} />
        ))}
      </div>
      <div className="relative h-[9px] rounded-[2px] bg-gradient-to-b from-[#fdfcf9] to-[#d6cfc0] shadow-[0_3px_6px_-2px_rgba(0,0,0,0.25)]" />
      <div data-led className="relative mx-1 h-[3px] rounded-full bg-[#6f8bff] shadow-[0_0_8px_2px_rgba(52,90,235,0.85),0_0_26px_8px_rgba(30,58,175,0.4)]" />
      {/* La luz que cae sobre la pared: se apaga hacia abajo y hacia los extremos de la balda. */}
      <div className="h-12 bg-gradient-to-b from-[rgba(36,64,185,0.24)] to-transparent [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]" />
    </div>
  );
}

/** Las copas colgadas boca abajo del copero, sobre la barra. Tintinean al aparecer y al pasar por encima. */
export function Copero({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative", className)}>
      <div className="relative z-10 h-3.5 bg-gradient-to-b from-[#4a3828] to-[#21180f] shadow-[0_6px_10px_-4px_rgba(0,0,0,0.45)]" />
      <div className="-mt-px flex justify-center gap-3 overflow-hidden px-2 drop-shadow-[0_8px_6px_rgba(0,0,0,0.12)] sm:gap-4">
        {Array.from({ length: 32 }, (_, i) => (
          <svg key={i} viewBox="0 0 30 88" className="copa-colgada h-[70px] w-auto shrink-0 sm:h-[84px]" style={{ "--i": i % 12 } as CSSProperties}>
            <ellipse cx={15} cy={2.6} rx={11} ry={2.2} fill="url(#dp-cristal)" stroke="#5f7184" strokeOpacity={0.5} strokeWidth={0.7} />
            <rect x={14.2} y={4} width={1.6} height={28} fill="#b9c6d2" />
            <path d="M13 32C4 36 2.5 58 5 84H25C27.5 58 26 36 17 32Z" fill="url(#dp-cristal)" stroke="#5f7184" strokeOpacity={0.45} strokeWidth={0.8} />
            <ellipse cx={15} cy={84} rx={10} ry={2} fill="none" stroke="#5f7184" strokeOpacity={0.5} strokeWidth={0.8} />
            <path d="M8 46C7 58 7.4 70 8.4 79" fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={1.1} strokeLinecap="round" />
          </svg>
        ))}
      </div>
    </div>
  );
}

/* Cuerda más larga o más corta en cada cartel, para que no cuelguen en fila de soldados. */
const CUERDA = [26, 40, 30, 46];
const VAIVEN = ["6.2s", "7.4s", "5.6s", "6.8s"];

/** Los carteles negros colgados de un clavo, con su mensaje a mano. */
export function Carteles({ label, className }: { label: string; className?: string }) {
  return (
    <ul aria-label={label} className={cn("grid grid-cols-2 items-start gap-x-4 gap-y-2 sm:flex sm:justify-center sm:gap-7", className)}>
      {CARTELES.map((c, i) => (
        <li key={c.id} className="flex justify-center">
          <div className="cartel-colgado flex w-full max-w-[220px] flex-col items-center sm:w-[200px] lg:w-[220px]" style={{ "--dur": VAIVEN[i % 4], "--delay": `${-i * 1.3}s` } as CSSProperties}>
            <span aria-hidden className="relative z-10 size-2 rounded-full bg-[#5b534a] shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
            <svg aria-hidden viewBox="0 0 100 10" preserveAspectRatio="none" className="-mt-1 w-[78%]" style={{ height: CUERDA[i % 4] }}>
              <path d="M50 0L4 10M50 0L96 10" stroke="#6e655a" strokeWidth={1.2} vectorEffect="non-scaling-stroke" fill="none" />
            </svg>
            <div className="relative flex min-h-[104px] w-full items-center justify-center rounded-[6px] bg-gradient-to-b from-[#1d1d1d] to-[#0c0c0c] px-3.5 py-4 text-center shadow-[0_16px_22px_-12px_rgba(0,0,0,0.55)] ring-1 ring-black/60 sm:min-h-[120px] sm:px-5">
              <span aria-hidden className="absolute top-[5px] left-[11%] size-1 rounded-full bg-[#8a8178]" />
              <span aria-hidden className="absolute top-[5px] right-[11%] size-1 rounded-full bg-[#8a8178]" />
              <span aria-hidden className="pointer-events-none absolute inset-[5px] rounded-[3px] ring-1 ring-cream/10" />
              <p className="font-mano text-[19px] leading-[1.08] font-bold text-balance text-cream sm:text-[23px]">
                {c.text}
                <svg aria-hidden viewBox="0 0 60 6" className="mx-auto mt-1.5 block h-1.5 w-10">
                  <path d="M2 4C14 1 22 5 32 3S50 1 58 3" fill="none" stroke="#e3c46a" strokeWidth={1.6} strokeLinecap="round" />
                </svg>
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Degradados compartidos por las copas y las botellas (una vez por pared). */
function Degradados() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="dp-cristal" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.75} />
          <stop offset="0.45" stopColor="#dfe8f0" stopOpacity={0.35} />
          <stop offset="1" stopColor="#8fa3b6" stopOpacity={0.4} />
        </linearGradient>
        <linearGradient id="dp-vidrio" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.26} />
          <stop offset="0.28" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.72" stopColor="#000000" stopOpacity={0} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.3} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * La pared entera. `carteles={false}` deja solo copas y vino (la cabecera de /vinos).
 * `baldas` es cuántas estanterías se pintan.
 */
export default function ParedDelBar({ carteles = true, baldas = 2, signsLabel = "", className }: { carteles?: boolean; baldas?: number; signsLabel?: string; className?: string }) {
  /* `data-visto` la primera vez que asoma: entonces tintinean las copas (ver globals.css). */
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.setAttribute("data-visto", "");
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("pared grano relative isolate overflow-hidden", className)}>
      <Degradados />
      <Copero />
      {carteles ? <Carteles label={signsLabel} className="relative z-10 -mt-8 px-4 sm:-mt-10 sm:px-8" /> : null}
      <div className={cn("relative space-y-1 px-3 pb-2 sm:px-6", carteles ? "mt-6 sm:mt-8" : "mt-2")}>
        {Array.from({ length: baldas }, (_, i) => (
          <Balda key={i} seed={1974 + i * 37} />
        ))}
      </div>
    </div>
  );
}
