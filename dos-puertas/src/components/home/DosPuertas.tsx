"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PinchoArt from "@/components/ui/PinchoArt";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";
import { cn } from "@/lib/cn";

type Clave = "siempre" | "hoy";
const EASE = [0.16, 1, 0.3, 1] as const;

/*
 * El marco: el mismo arco de medio punto, con su doble filete dorado, que asoma al fondo de la
 * portada. Las de la portada crecen y se desvanecen al bajar… y aquí aparecen de verdad.
 */
function Marco() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute -inset-[9px] rounded-t-full border-[1.5px] border-b-0 border-oro/75" />
      <span aria-hidden className="pointer-events-none absolute -inset-[4px] rounded-t-full border border-b-0 border-oro/35" />
    </>
  );
}

/** La hoja de la puerta. La 1, verde botella con la letra del rótulo; la 2, clara y suave como el local por dentro. */
function Hoja({ k, n, name }: { k: Clave; n: string; name: string }) {
  const uno = k === "siempre";
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-0 overflow-hidden rounded-t-full",
      )}
      style={{
        backgroundImage: uno
          ? "repeating-linear-gradient(90deg, rgba(0,0,0,0.13) 0 1px, transparent 1px 9px), linear-gradient(180deg, #22402f, #13261e 70%)"
          : "repeating-linear-gradient(90deg, rgba(27,42,107,0.05) 0 1px, transparent 1px 11px), linear-gradient(180deg, #f6f2ea, #ddd6c8)",
      }}
    >
      {/* El cristal de arriba, con la luz de dentro. */}
      <span
        className={cn(
          "absolute inset-x-[14%] top-[8%] h-[34%] overflow-hidden rounded-t-full ring-1",
          uno ? "bg-[radial-gradient(80%_70%_at_50%_80%,rgba(232,162,74,0.55),rgba(232,162,74,0.08)_70%),#0f1d17] ring-oro/45" : "bg-[radial-gradient(80%_70%_at_50%_85%,rgba(84,122,255,0.45),rgba(84,122,255,0.06)_70%),#e9eef8] ring-[#1b2a6b]/25",
        )}
      >
        <span className="brillo-cristal absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <span
          className={cn(
            "absolute inset-0 flex items-end justify-center pb-[6%] font-rotulo leading-none",
            uno ? "logo-oro text-[clamp(2.4rem,9vw,4.6rem)]" : "text-[clamp(2.4rem,9vw,4.6rem)] text-[#1b2a6b]",
          )}
        >
          {n}
        </span>
      </span>
      {/* El nombre, pintado en la hoja: la 1 con la letra del rótulo, la 2 con una cursiva suave. */}
      <span
        className={cn(
          "absolute inset-x-[8%] top-[47%] text-center leading-[0.95]",
          uno ? "font-rotulo text-gradient-marca text-[clamp(1.25rem,5.4vw,2.35rem)] uppercase" : "font-display text-[clamp(1.2rem,5vw,2.1rem)] font-medium text-[#1b2a6b] italic",
        )}
      >
        {name}
      </span>
      <span className={cn("absolute inset-x-[14%] bottom-[6%] h-[26%] rounded-md ring-1", uno ? "ring-oro/25" : "ring-[#1b2a6b]/15")} />
      {/* El pomo, al lado contrario de las bisagras. */}
      <span
        className={cn(
          "absolute top-[58%] size-[7%] min-h-2 min-w-2 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.45)]",
          uno ? "right-[7%] bg-[radial-gradient(circle_at_35%_35%,#fbe7a8,#b8963f)]" : "left-[7%] bg-[radial-gradient(circle_at_35%_35%,#ffffff,#9aa3b5)]",
        )}
      />
    </span>
  );
}

function Puerta({ k, scrollOpen, reduced }: { k: Clave; scrollOpen: MotionValue<number>; reduced: boolean }) {
  const t = useMessages().puertas;
  const lp = useLocalePath();
  const d = t.doors[k];
  const uno = k === "siempre";
  const interiorId = useId();
  const firstLink = useRef<HTMLAnchorElement>(null);

  /* Abierta por el scroll o porque se ha tocado: vale lo que esté más abierto. */
  const forced = useMotionValue(0);
  const open = useTransform([scrollOpen, forced], ([s, f]: number[]) => Math.max(s, f));
  const rotateY = useTransform(open, [0, 1], [0, uno ? -112 : 112]);
  const sombra = useTransform(open, [0, 1], [0, 0.7]);
  const dentro = useTransform(open, [0.45, 0.9], [0, 1]);
  const dentroY = useTransform(open, [0.45, 0.9], [16, 0]);
  const luz = useTransform(open, [0.05, 0.8], [0, 1]);
  const [abierta, setAbierta] = useState(false);
  useMotionValueEvent(open, "change", (v) => setAbierta(v > 0.55));

  /* Sin movimiento, las puertas ya están abiertas. */
  useEffect(() => {
    if (reduced) forced.set(1);
  }, [reduced, forced]);

  const abrir = () => {
    animate(forced, 1, { duration: reduced ? 0 : 1.2, ease: EASE });
    window.setTimeout(() => firstLink.current?.focus({ preventScroll: true }), reduced ? 0 : 650);
  };

  return (
    <div className="flex flex-col items-center">
      <p className={cn("mb-4 font-caps text-[10px] font-semibold tracking-[0.3em] uppercase sm:text-[11px]", uno ? "text-oro-a11y" : "text-[#b9c8ff]")}>{d.label}</p>
      <div className="relative w-[min(40vw,250px,28svh)]">
        <Marco />
        <div className="relative aspect-[14/25] overflow-hidden rounded-t-full">
          {/* Lo que hay detrás de cada puerta. */}
          <div
            id={interiorId}
            inert={!abierta}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-end px-[9%] pb-[9%] text-center",
              uno
                ? "bg-[radial-gradient(90%_60%_at_50%_30%,rgba(232,162,74,0.42),transparent_75%),#122219]"
                : "pared",
            )}
          >
            {/* Dentro de la 2: la pared blanca con la luz azul de las baldas. */}
            {!uno ? (
              <>
                <span aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_55%_at_50%_100%,rgba(60,96,230,0.3),transparent_70%)]" />
                <span aria-hidden className="absolute inset-x-0 top-[26%] h-[3px] bg-[#6f8bff] shadow-[0_0_10px_3px_rgba(52,90,235,0.75)]" />
              </>
            ) : null}
            <motion.div style={reduced ? undefined : { opacity: dentro, y: dentroY }} className="relative flex w-full flex-col items-center">
              <PinchoArt kind={uno ? "calamar" : "copa"} className="hidden w-[34%] sm:block" />
              <p
                className={cn(
                  "mt-1 leading-[0.95] sm:mt-2",
                  uno ? "font-rotulo text-gradient-marca text-[clamp(1.2rem,5vw,1.9rem)] uppercase" : "font-display text-[clamp(1.15rem,4.6vw,1.75rem)] font-medium text-[#1b2a6b] italic",
                )}
              >
                {d.name}
              </p>
              <p className={cn("mt-1.5 text-[11.5px] leading-snug text-pretty sm:mt-2 sm:text-[13px]", uno ? "text-cream-muted" : "text-[#2a3350]")}>{d.text}</p>
              <ul className="mt-2.5 flex w-full flex-col gap-1.5 sm:mt-3.5 sm:gap-2">
                {d.links.map((l, i) => (
                  <li key={l.path}>
                    <Link
                      ref={i === 0 ? firstLink : undefined}
                      href={lp(l.path)}
                      className={cn(
                        "pulsable group flex min-h-9 w-full items-center justify-between gap-1 rounded-full px-3 text-[12px] font-semibold sm:min-h-10 sm:px-4 sm:text-[13.5px]",
                        uno ? "bg-oro text-botella hover:bg-oro-light" : "bg-[#1b2a6b] text-[#f4f0e8] hover:bg-[#243a8f]",
                      )}
                    >
                      {l.label}
                      <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* La hoja: se abre hacia dentro con el scroll o al tocarla. */}
          <motion.button
            type="button"
            onClick={abrir}
            aria-label={format(t.open, { n: d.n, name: d.name })}
            aria-expanded={abierta}
            aria-controls={interiorId}
            tabIndex={abierta ? -1 : 0}
            className={cn("absolute inset-0 rounded-t-full outline-offset-4", abierta && "pointer-events-none")}
            style={{ rotateY, transformPerspective: 1000, transformOrigin: uno ? "0% 50%" : "100% 50%" }}
          >
            <Hoja k={k} n={d.n} name={d.name} />
            <motion.span aria-hidden className="absolute inset-0 rounded-t-full bg-black" style={{ opacity: sombra }} />
          </motion.button>
        </div>
      </div>
      {/* La luz que sale por la puerta y cae al suelo. */}
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none -mt-3 block h-10 w-[150%] rounded-[50%]",
          uno ? "bg-[radial-gradient(50%_50%_at_50%_50%,rgba(232,162,74,0.5),transparent)]" : "bg-[radial-gradient(50%_50%_at_50%_50%,rgba(84,122,255,0.45),transparent)]",
        )}
        style={{ opacity: luz }}
      />
    </div>
  );
}

/**
 * Lo primero tras la portada: las dos puertas. Al bajar se abren (la 2, un poco después) y dejan
 * ver lo que hay detrás de cada una; también se abren al tocarlas. Solo `transform` y `opacity`.
 */
export default function DosPuertas() {
  const t = useMessages().puertas;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { scrollYProgress: entrada } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const open1 = useTransform(scrollYProgress, [0.08, 0.5], [0, 1]);
  const open2 = useTransform(scrollYProgress, [0.16, 0.58], [0, 1]);
  const pista = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const subeY = useTransform(entrada, [0.2, 1], [90, 0]);
  const subeO = useTransform(entrada, [0.2, 0.85], [0, 1]);

  return (
    <section ref={ref} id="puertas" aria-labelledby="puertas-title" className={cn("relative scroll-mt-0", reduced ? "" : "h-[230svh]")}>
      <div className={cn("grano flex flex-col items-center justify-center overflow-hidden px-4", reduced ? "py-24" : "sticky top-0 h-[100svh] pt-16")}>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_62%,rgba(227,196,106,0.12),transparent_70%)]" />
        <motion.div style={reduced ? undefined : { y: subeY, opacity: subeO }} className="relative flex flex-col items-center">
          <p className="flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">
            <span aria-hidden className="h-px w-8 bg-oro-light/70" />
            {t.kicker}
            <span aria-hidden className="h-px w-8 bg-oro-light/70" />
          </p>
          <h2 id="puertas-title" className="mt-3 text-center font-display text-[clamp(2rem,8vw,4rem)] leading-[1] font-medium">
            {t.titleBefore} <span className="palabra-rotulo text-gradient-marca">{t.titleAccent}</span>
          </h2>
          <p className="mt-3 text-center text-[14px] text-cream-muted sm:text-base">{t.lead}</p>

          <div className="mt-[clamp(1.75rem,5svh,3.5rem)] flex items-end justify-center gap-[7vw] sm:gap-20">
            <Puerta k="siempre" scrollOpen={open1} reduced={reduced} />
            <Puerta k="hoy" scrollOpen={open2} reduced={reduced} />
          </div>
          {/* El umbral: una línea de luz a los pies de las dos. */}
          <span aria-hidden className="-mt-5 block h-px w-[min(92vw,720px)] bg-gradient-to-r from-transparent via-oro/45 to-transparent" />
          {reduced ? null : (
            <motion.p style={{ opacity: pista }} className="mt-6 text-center text-[11px] font-medium tracking-[0.18em] text-cream-faint uppercase">
              {t.hint}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
