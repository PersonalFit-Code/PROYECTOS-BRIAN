import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  /** parte del título resaltada en cursiva/rojo */
  accent?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}

/**
 * Cabecera de sección homogénea: kicker en mayúsculas rojas, título display serif, descripción.
 * Añade `data-reveal` a cada elemento para que las secciones lo animen con GSAP ScrollTrigger.
 */
export default function SectionHeading({ kicker, title, accent, description, align = "left", className, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <p data-reveal className="mb-4 inline-flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-[0.3em] text-pimenton-light">
          <span aria-hidden className="h-px w-8 bg-pimenton-light/70" />
          {kicker}
          {align === "center" && <span aria-hidden className="h-px w-8 bg-pimenton-light/70" />}
        </p>
      )}
      <Tag data-reveal className="font-display text-4xl leading-[1.05] text-cream md:text-5xl lg:text-6xl text-balance">
        {title}{" "}
        {accent && <em className="text-gradient-ember not-italic font-display italic">{accent}</em>}
      </Tag>
      {description && (
        <p data-reveal className="mt-5 text-base leading-relaxed text-cream-muted md:text-lg text-pretty">
          {description}
        </p>
      )}
    </div>
  );
}
