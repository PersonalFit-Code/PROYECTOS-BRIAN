import type { ReactNode } from "react";
import { cx } from "@/lib/formato";

/** Contenedor de página: columna centrada y holgada, como una página de Notion. */
export function Pagina({ children, ancha, className }: { children: ReactNode; ancha?: boolean; className?: string }) {
  return <div className={cx("mx-auto w-full px-4 pt-8 pb-28 sm:px-10 md:pb-16 md:pt-14", ancha ? "max-w-5xl" : "max-w-3xl", className)}>{children}</div>;
}
