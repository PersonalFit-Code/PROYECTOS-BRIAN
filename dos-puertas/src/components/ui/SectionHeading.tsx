import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  kicker: string;
  before: string;
  accent: string;
  after?: string;
  lead?: string;
  as?: "h1" | "h2";
  align?: "left" | "center";
  children?: ReactNode;
  id?: string;
  /** Arriba del todo de la página: entra con CSS al cargar en vez de esperar al scroll (y al JS). */
  entrada?: boolean;
}

/** Kicker en versalitas con filete → titular con una palabra en letra del rótulo → entradilla. */
export default function SectionHeading({ kicker, before, accent, after, lead, as: Tag = "h2", align = "left", id, children, entrada = false }: Props) {
  /* Con `entrada`, la animación de carga (.hero-in, escalonada con --i); si no, el revelado al hacer scroll. */
  const anim = (reveal: string | true, i: number) =>
    entrada ? { className: "hero-in", style: { ["--i" as string]: i } } : { "data-reveal": reveal, className: "" };
  const k = anim("fade", 0);
  const h = anim("letterbox", 1);
  const l = anim(true, 2);
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p data-reveal={k["data-reveal"]} style={k.style} className={cn(k.className, "flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase", align === "center" && "justify-center")}>
        <span aria-hidden className="h-px w-8 bg-oro-light/70" />
        {kicker}
      </p>
      <Tag id={id} data-reveal={h["data-reveal"]} style={h.style} className={cn(h.className, "mt-4 font-display text-[2.4rem] leading-[1] font-medium text-balance sm:text-5xl lg:text-6xl")}>
        {before} <span className="palabra-rotulo text-gradient-marca whitespace-nowrap">{accent}</span>
        {after ? ` ${after}` : null}
      </Tag>
      {lead ? (
        <p data-reveal={l["data-reveal"]} style={l.style} className={cn(l.className, "mt-5 text-[15px] leading-relaxed text-pretty text-cream-muted sm:text-base")}>
          {lead}
        </p>
      ) : null}
      {children}
    </div>
  );
}
