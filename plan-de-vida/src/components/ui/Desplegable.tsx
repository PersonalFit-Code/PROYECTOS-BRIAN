"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cx } from "@/lib/formato";

/**
 * Bloque desplegable de cristal: cabecera con icono, título, resumen a la derecha y flecha. Al tocarlo
 * se abre con una animación de altura. Es la pieza que ordena cada apartado en vez de una página larga.
 */
export function Desplegable({
  icono,
  titulo,
  resumen,
  children,
  abierto: inicial = false,
  color = "gray",
  i = 0,
  className,
}: {
  icono?: ReactNode;
  titulo: ReactNode;
  resumen?: ReactNode;
  children: ReactNode;
  abierto?: boolean;
  color?: string;
  i?: number;
  className?: string;
}) {
  const [abierto, setAbierto] = useState(inicial);
  return (
    <section className={cx("glass entrar mb-3 overflow-hidden rounded-2xl", className)} style={{ ["--i" as string]: i }}>
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-hover/60"
      >
        {icono && (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl [&_svg]:size-4.5" style={{ background: `var(--tag-${color}-bg)`, color: `var(--tag-${color}-fg)` }}>
            {icono}
          </span>
        )}
        <span className="min-w-0 flex-1 font-semibold">{titulo}</span>
        {resumen != null && <span className="shrink-0 text-sm text-muted">{resumen}</span>}
        <motion.span animate={{ rotate: abierto ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="text-muted">
          <ChevronDown className="size-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="contenido"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t border-line/60 px-4 pt-3 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
