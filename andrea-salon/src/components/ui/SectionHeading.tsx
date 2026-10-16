import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  /** Parte del título resaltada (la didona de titulares, recta: el contrapunto de la parte en Jost). */
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
 * Cabecera de sección de la línea editorial: etiqueta pequeña en mayúscula espaciada con filete,
 * titular en la didona de titulares MAYÚSCULA con tracking amplio (tipo portada de revista) y la palabra de acento en
 * en didona, entradilla en Jost. Añade `data-reveal` a cada elemento para que las
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
        <p data-reveal={k["data-reveal"]} style={k.style} className={cn(k.className, "mb-5 inline-flex items-center gap-3 font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-carmin-suave")}>
          <span aria-hidden className="h-px w-10 bg-nude" />
          {kicker}
          {align === "center" && <span aria-hidden className="h-px w-10 bg-nude" />}
        </p>
      )}
      <Tag id={id} data-reveal={h["data-reveal"]} style={h.style} className={cn(h.className, "titulo-editorial text-[2rem] text-tinta text-balance sm:text-5xl lg:text-6xl")}>
        {title}
        {accent && (
          <>
            {" "}
            <em className="acento-editorial">{accent}</em>
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
