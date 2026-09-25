"use client";

import { Beer, Church, CreditCard, Leaf, Sparkles, WheatOff, Wine, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import MapCard from "@/components/ui/MapCard";
import OpenStatus from "@/components/ui/OpenStatus";
import SectionHeading from "@/components/ui/SectionHeading";
import { BUSINESS } from "@/data/business";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/**
 * Experience — "Experiencia y ubicación" (#experiencia).
 *
 *  · Fondo de piedra de catedral (/textures/stone.webp) con velo burdeos y capas decorativas
 *    (resplandor rojo, gotas de aceite, arco románico en SVG) que se mueven a distintas
 *    velocidades con `data-parallax` (GSAP ScrollTrigger scrub).
 *  · Marquesina superior con las especialidades de la casa.
 *  · Rejilla de 2 columnas en lg: izquierda cabecera + estado + servicios + foto; derecha mapa 3D
 *    (sticky). En móvil, una columna con orden cabecera → estado → mapa → foto → servicios.
 *  · Reveals escalonados con useScrollReveal (elementos `data-reveal`).
 */

const MARQUEE_PHRASES = [
  "Zamburiñas a la plancha",
  "Pulpo con grelos",
  "Vinos de Ribeiro, Valdeorras y Rías Baixas",
  "Cerveza artesana",
  "Terraza junto a la Catedral",
] as const;

const FEATURE_ICONS: ReadonlyArray<{ match: RegExp; icon: LucideIcon }> = [
  { match: /terraza|catedral/i, icon: Church },
  { match: /vegan|vegetar/i, icon: Leaf },
  { match: /gluten/i, icon: WheatOff },
  { match: /vino|d\.o\./i, icon: Wine },
  { match: /cerveza/i, icon: Beer },
  { match: /tarjeta/i, icon: CreditCard },
];

/** Servicios con su icono resuelto en módulo (nunca durante el render). */
const FEATURES: ReadonlyArray<{ label: string; Icon: LucideIcon }> = BUSINESS.features.map((label) => ({
  label,
  Icon: FEATURE_ICONS.find((f) => f.match.test(label))?.icon ?? Sparkles,
}));

const HIGHLIGHTS = ["Casco histórico", "Zona de viños", "Terraza todo el año"] as const;

/** Gotas de aceite flotantes: posición, velocidad parallax y ritmo de flotación. */
const OIL_DROPS = [
  { className: "left-[6%] top-[18%] h-24 w-16", speed: 0.5, delay: "0s", duration: "7s" },
  { className: "right-[10%] top-[34%] h-16 w-11", speed: 0.85, delay: "1.2s", duration: "9s" },
  { className: "left-[40%] bottom-[12%] h-20 w-14", speed: 0.3, delay: "2.1s", duration: "8s" },
  { className: "right-[28%] bottom-[24%] h-12 w-8", speed: 0.65, delay: "0.6s", duration: "6.5s" },
] as const;

/* ────────────────────────────────────────────────────────────
   Piezas decorativas
   ──────────────────────────────────────────────────────────── */

/** Marquesina horizontal: contenido duplicado para un bucle continuo (animate-marquee → -50 %). */
function Marquee() {
  return (
    <div className="relative border-y border-cream/10 bg-iron-900/70 py-3 backdrop-blur-sm [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <p className="sr-only">Especialidades: {MARQUEE_PHRASES.join(", ")}.</p>
      <div aria-hidden className="flex w-max animate-marquee will-change-transform hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {MARQUEE_PHRASES.map((phrase) => (
              <li
                key={`${copy}-${phrase}`}
                className="flex items-center gap-5 px-5 font-condensed text-xl uppercase tracking-[0.14em] text-cream/85 md:text-2xl"
              >
                {phrase}
                <span className="text-pimenton-light">·</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/** Arco románico del Pórtico del Paraíso con rosetón, trazado en línea crema. */
function CathedralArch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 760" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      {/* arquivoltas */}
      <path d="M30 760V380a180 180 0 0 1 360 0v380" />
      <path d="M70 760V392a140 140 0 0 1 280 0v368" />
      <path d="M110 760V404a100 100 0 0 1 200 0v356" />
      <path d="M150 760V416a60 60 0 0 1 120 0v344" strokeDasharray="6 12" />
      {/* capiteles */}
      <path d="M22 380h16M62 392h16M102 404h16M142 416h16M262 416h16M302 404h16M342 392h16M382 380h16" />
      {/* rosetón */}
      <circle cx="210" cy="100" r="56" />
      <circle cx="210" cy="100" r="34" />
      <circle cx="210" cy="100" r="10" />
      {[0, 30, 60, 90, 120, 150].map((angle) => (
        <line key={angle} x1="210" y1="44" x2="210" y2="156" transform={`rotate(${angle} 210 100)`} />
      ))}
    </svg>
  );
}

/** Capas de fondo con parallax. La velocidad se declara en `data-parallax`. */
function ParallaxBackdrop() {
  return (
    <>
      {/* piedra de catedral (ligeramente sobredimensionada para que el parallax no descubra bordes) */}
      <div
        aria-hidden
        data-parallax="0.12"
        className="absolute inset-x-0 -top-[10%] -bottom-[10%] bg-[url('/textures/stone.webp')] bg-cover bg-center opacity-40 will-change-transform"
      />
      {/* velo burdeos para legibilidad */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,8,11,0.94)_0%,rgba(58,14,19,0.82)_30%,rgba(34,8,11,0.86)_70%,rgba(18,18,18,0.96)_100%)]"
      />
      {/* resplandor rojo grande */}
      <div
        aria-hidden
        data-parallax="0.35"
        className="absolute -left-[22%] top-[8%] h-[80vw] max-h-[760px] w-[80vw] max-w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(216,50,60,0.36),rgba(178,30,39,0.12)_50%,transparent_100%)] blur-3xl will-change-transform"
      />
      {/* resplandor dorado, más lento y en la esquina opuesta */}
      <div
        aria-hidden
        data-parallax="0.2"
        className="absolute -right-[18%] bottom-[4%] h-[60vw] max-h-[520px] w-[60vw] max-w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(232,194,122,0.16),transparent_70%)] blur-3xl will-change-transform"
      />
      {/* arco de la Catedral */}
      <div aria-hidden data-parallax="0.22" className="absolute -right-[8%] top-[6%] w-[62vw] max-w-[440px] text-cream/10 will-change-transform md:right-[2%] lg:right-[38%] lg:top-[10%]">
        <CathedralArch className="h-auto w-full" />
      </div>
      {/* gotas de aceite: el parallax va en el contenedor y la flotación CSS en el hijo (transform no colisiona) */}
      {OIL_DROPS.map((drop) => (
        <div key={drop.className} aria-hidden data-parallax={drop.speed} className={`absolute will-change-transform ${drop.className}`}>
          <span
            className="block h-full w-full animate-float bg-[radial-gradient(circle_at_35%_30%,rgba(232,194,122,0.55),rgba(255,106,61,0.28)_45%,rgba(178,30,39,0.1)_75%,transparent_100%)] opacity-70 blur-[2px]"
            style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", animationDelay: drop.delay, animationDuration: drop.duration }}
          />
        </div>
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Sección
   ──────────────────────────────────────────────────────────── */
export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section
      id="experiencia"
      ref={sectionRef}
      className="noise after:noise-after relative isolate overflow-clip bg-burgundy-deep"
    >
      <ParallaxBackdrop />

      <div className="relative">
        <Marquee />

        <div className="container-page py-20 md:py-28 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-x-14 lg:gap-y-12">
            {/* 1 · Cabecera */}
            <div className="order-1 lg:col-start-1">
              <SectionHeading
                kicker="La experiencia"
                title="Tapeo con vistas a la"
                accent="Catedral"
                description="Nuestra terraza mira a la Catedral de San Martiño y a la iglesia de Santa Eufemia, en pleno casco histórico: la “zona de viños” de Ourense, donde el tapeo es una forma de vivir la ciudad."
              />
              <ul data-reveal className="mt-6 flex flex-wrap gap-2">
                {HIGHLIGHTS.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>

            {/* 2 · Estado en vivo */}
            <div data-reveal className="order-2 lg:col-start-1">
              <OpenStatus />
            </div>

            {/* 3 · Mapa 3D (columna derecha completa en lg, sticky) */}
            <div
              data-reveal
              className="order-3 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:self-start lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]"
            >
              <MapCard />
            </div>

            {/* 4 · Servicios (en lg va antes que la foto) */}
            <div className="order-5 lg:order-4 lg:col-start-1">
              <h3 data-reveal className="font-display text-2xl text-cream">
                Lo que te espera en la <em className="text-gradient-ember not-italic">tixola</em>
              </h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {FEATURES.map(({ label, Icon }) => (
                  <li key={label} data-reveal className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pimenton/15 text-gold">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-cream-200">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5 · Foto real de la fachada */}
            <figure data-reveal className="order-4 lg:order-5 lg:col-start-1">
              <div className="group relative overflow-hidden rounded-3xl border border-gold/20 shadow-card">
                <Image
                  src="/images/fachada.jpg"
                  alt="Fachada y terraza de Tixola Tapería en la Rúa Juan de Austria, junto a la Catedral de Ourense"
                  width={806}
                  height={490}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="h-auto w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(12,12,12,0.7)_100%)]" />
                <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cream/85">
                  Foto real
                </span>
              </div>
              <figcaption className="mt-3 flex items-center gap-3 text-sm text-cream-muted">
                <span aria-hidden className="h-px w-8 bg-gold/60" />
                Nuestra terraza en Rúa Juan de Austria
              </figcaption>
            </figure>
          </div>
        </div>

        <div aria-hidden className="divider-iron" />
      </div>
    </section>
  );
}
