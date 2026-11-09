import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Variantes:
 *  - venta (alias «acento»): la acción que vende. Inscríbete, pagar, reservar.
 *  - info (alias «contorno» / «contorno-oscuro»): información, WhatsApp, ver más. Hereda el color
 *    del texto, así que sirve sobre negro (blanco) y sobre claro (negro).
 *  - blanco / negro: neutros con barrido.
 */
type Variante = "venta" | "acento" | "info" | "blanco" | "contorno" | "contorno-oscuro" | "negro";

const variantes: Record<Variante, string> = {
  venta: "boton-venta",
  acento: "boton-venta",
  info: "boton-info",
  contorno: "boton-info text-white",
  "contorno-oscuro": "boton-info text-negro",
  blanco: "boton-barrido bg-white text-negro [--barrido:#d9d9db]",
  negro: "boton-barrido bg-negro text-white [--barrido:#3a3a3e]",
};

export function claseBoton(variante: Variante = "venta", grande = false) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap subtitular",
    grande ? "h-12 px-6 text-[15px]" : "h-11 px-5 text-[14px]",
    variantes[variante],
  );
}

export default function Boton({
  href,
  children,
  variante = "venta",
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
