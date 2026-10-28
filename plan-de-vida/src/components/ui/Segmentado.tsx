"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useId, type ReactNode } from "react";
import { cx } from "@/lib/formato";

export interface OpcionSegmento {
  valor: string;
  etiqueta: string;
  icono?: ReactNode;
  href?: string;
}

/** Control segmentado de cristal con la pastilla de selección deslizándose entre opciones. */
export function Segmentado({ opciones, valor, onChange, className }: { opciones: OpcionSegmento[]; valor: string; onChange?: (v: string) => void; className?: string }) {
  const id = useId();
  return (
    <div className={cx("glass inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl p-1", className)}>
      {opciones.map((o) => {
        const activo = o.valor === valor;
        const contenido = (
          <>
            {activo && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-xl bg-bg shadow-sm" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className="relative flex items-center gap-1.5">
              {o.icono && <span className="[&_svg]:size-4">{o.icono}</span>}
              {o.etiqueta}
            </span>
          </>
        );
        const clase = cx("relative shrink-0 rounded-xl px-3 py-1.5 text-sm transition", activo ? "font-medium text-fg" : "text-muted hover:text-fg");
        return o.href ? (
          <Link key={o.valor} href={o.href} className={clase} scroll={false}>
            {contenido}
          </Link>
        ) : (
          <button key={o.valor} type="button" onClick={() => onChange?.(o.valor)} className={clase}>
            {contenido}
          </button>
        );
      })}
    </div>
  );
}
