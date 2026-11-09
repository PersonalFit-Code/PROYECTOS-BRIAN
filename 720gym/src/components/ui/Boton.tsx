import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variante = "acento" | "blanco" | "contorno" | "contorno-oscuro" | "negro";

const variantes: Record<Variante, string> = {
  acento: "bg-acento text-acento-tinta [--barrido:var(--acento-oscuro)]",
  blanco: "bg-white text-negro [--barrido:#e9e9e7]",
  negro: "bg-negro text-white [--barrido:#2a2a2d]",
  contorno: "text-white ring-1 ring-inset ring-white/35 hover:ring-white [--barrido:rgb(255_255_255/0.08)]",
  "contorno-oscuro": "text-negro ring-1 ring-inset ring-negro/30 hover:ring-negro [--barrido:rgb(0_0_0/0.05)]",
};

export function claseBoton(variante: Variante = "acento", grande = false) {
  return cn(
    "boton-barrido inline-flex items-center justify-center gap-2 whitespace-nowrap subtitular transition-[box-shadow,color] duration-300 active:scale-[0.98]",
    grande ? "h-14 px-7 text-[19px]" : "h-12 px-5 text-[17px]",
    variantes[variante],
  );
}

export default function Boton({
  href,
  children,
  variante = "acento",
  grande = false,
  className,
  externo = false,
}: {
  href: string;
  children: ReactNode;
  variante?: Variante;
  grande?: boolean;
  className?: string;
  externo?: boolean;
}) {
  const clase = cn(claseBoton(variante, grande), className);
  if (externo || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={clase} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={clase}>
      {children}
    </Link>
  );
}
