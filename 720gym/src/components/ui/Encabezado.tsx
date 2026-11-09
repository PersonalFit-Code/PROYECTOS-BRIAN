import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Cabecera de sección: número + etiqueta, titular stencil y entradilla. */
export default function Encabezado({
  numero,
  etiqueta,
  titulo,
  children,
  tono = "oscuro",
  className,
  id,
}: {
  numero?: string;
  etiqueta: string;
  titulo: ReactNode;
  children?: ReactNode;
  tono?: "oscuro" | "claro";
  className?: string;
  id?: string;
}) {
  return (
    <header className={cn("max-w-3xl", className)}>
      <p data-reveal className={cn("etiqueta flex items-center gap-3", tono === "oscuro" ? "text-white/60" : "text-negro/55")}>
        {numero && <span className="text-acento">{numero}</span>}
        <span className={cn("h-px w-8", tono === "oscuro" ? "bg-white/25" : "bg-negro/25")} aria-hidden />
        {etiqueta}
      </p>
      <h2 id={id} data-reveal className="titular mt-4 text-[clamp(2.1rem,3.6vw,3.1rem)]">
        {titulo}
      </h2>
      {children && (
        <div data-reveal className={cn("mt-5 max-w-2xl text-[16px] leading-relaxed sm:text-[17px]", tono === "oscuro" ? "text-white/70" : "text-negro/70")}>
          {children}
        </div>
      )}
    </header>
  );
}
