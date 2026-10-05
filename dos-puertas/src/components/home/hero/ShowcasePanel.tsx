import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Contenedor de cristal para la columna derecha de la portada. Es un hueco modular: lo que va dentro
 * (`children`) es intercambiable —hoy, la barra y los pinchos; mañana, un componente de 21st.dev
 * (menú con pestañas, carrusel de fotos…)— sin tocar el marco ni la maquetación de la portada.
 */
export default function ShowcasePanel({
  label,
  actions,
  children,
  className,
}: {
  label: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-label={label} className={cn("panel-cristal relative rounded-[30px] p-2 sm:p-2.5", className)}>
      <header className="flex items-center justify-between gap-3 py-1.5 pr-1 pl-3 sm:py-2 sm:pl-4">
        <p className="flex items-center gap-2 font-caps text-[10px] font-semibold tracking-[0.26em] text-oro-a11y uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-oro shadow-[0_0_10px_rgba(227,196,106,0.9)]" />
          {label}
        </p>
        {actions}
      </header>
      <div className="relative overflow-hidden rounded-[22px] bg-botella-900/50 ring-1 ring-cream/[0.08]">{children}</div>
    </section>
  );
}
