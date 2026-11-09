import { cn } from "@/lib/utils";

/**
 * Fondo de marca: degradados plateados que se mueven despacio, grano fino y el «720» del logo como
 * marca de agua con degradado. Va detrás del contenido (absolute).
 */
export default function FondoMarca({ className, agua = true, lado = "derecha" }: { className?: string; agua?: boolean; lado?: "derecha" | "centro" }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden grano", className)} aria-hidden>
      <div className="fondo-marca fondo-vivo absolute -inset-[8%]" />
      {agua && (
        <span
          className={cn(
            "marca-agua absolute text-[58vw] lg:text-[30vw]",
            lado === "derecha" ? "-right-[4vw] -bottom-[4vw] lg:top-1/2 lg:right-[2vw] lg:bottom-auto lg:-translate-y-[42%]" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          )}
        >
          720
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-negro to-transparent" />
    </div>
  );
}
