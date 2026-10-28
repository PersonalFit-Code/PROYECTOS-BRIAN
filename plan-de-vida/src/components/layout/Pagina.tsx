import type { ReactNode } from "react";
import { cx } from "@/lib/formato";

/** Contenedor de página: columna centrada y holgada, como una página de Notion. */
export function Pagina({ children, ancha, className }: { children: ReactNode; ancha?: boolean; className?: string }) {
  return <div className={cx("mx-auto w-full px-4 pt-6 pb-32 sm:px-8 md:pb-16 md:pt-10", ancha ? "max-w-5xl" : "max-w-3xl", className)}>{children}</div>;
}
