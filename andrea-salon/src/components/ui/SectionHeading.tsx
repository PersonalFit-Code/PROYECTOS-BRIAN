import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  /** Parte del título resaltada en cursiva carmín. */
  accent?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
  id?: string;
  /** Arriba del todo de la página: entra con CSS al cargar en vez de esperar al scroll (y al JS). */
  entrada?: boolean;
}

/**
 * Cabecera de sección homogénea: kicker en versalitas con filete carmín, título display serif con
 * una palabra acentuada en itálica, entradilla. Añade `data-reveal` a cada elemento para que las
 * secciones lo animen con `useReveal`; con `entrada`, usa la animación de carga (`.hero-in`,
 * escalonada con `--i`) para no depender del JavaScript en lo primero que se ve (LCP).
 */
export default function SectionHeading({ kicker, title, accent, description, align = "left", className, as: Tag = "h2", id, entrada = false }: SectionHeadingProps) {
  const anim = (reveal: string | true, i: number) =>
    entrada ? { className: "hero-in", style: { ["--i" as string]: i } } : { "data-reveal": reveal, className: "" };
  const k = anim("fade", 0);
  const h = anim("letterbox", 1);
  const d = anim(true, 2);
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <p data-reveal={k["data-reveal"]} style={k.style} className={cn(k.className, "mb-4 inline-flex items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-carmin-suave")}>
          <span aria-hidden className="h-px w-8 bg-carmin-suave/60" />
          {kicker}
          {align === "center" && <span aria-hidden className="h-px w-8 bg-carmin-suave/60" />}
        </p>
      )}
      <Tag id={id} data-reveal={h["data-reveal"]} style={h.style} className={cn(h.className, "font-display text-4xl leading-[1.05] font-semibold tracking-[-0.01em] text-tinta text-balance md:text-5xl lg:text-6xl")}>
        {title}
        {accent && (
          <>
            {" "}
            <em className="font-display italic font-normal text-carmin">{accent}</em>
          </>
        )}
      </Tag>
      {description && (
        <p data-reveal={d["data-reveal"]} style={d.style} className={cn(d.className, "mt-5 text-base leading-relaxed text-gris text-pretty md:text-lg")}>
          {description}
        </p>
      )}
    </div>
  );
}
