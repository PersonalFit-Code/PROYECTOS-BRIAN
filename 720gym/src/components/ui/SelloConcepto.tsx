import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo de la disciplina o del club en su recuadro negro (los logos que pasó Brais, blanco sobre
 * negro, todos de 150 × 150). Sin logo propio, «720 GYM» dibujado con la misma letra y las mismas
 * proporciones que los demás para que todos pesen igual en el recuadro.
 */
export default function SelloConcepto({ logo, nombre, className, sizes = "96px" }: { logo?: string; nombre: string; className?: string; sizes?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden bg-black ring-1 ring-white/15", className)}>
      {logo ? (
        <Image src={logo} alt={`Logo de ${nombre}`} fill sizes={sizes} className="object-cover" />
      ) : (
        <svg viewBox="0 0 150 150" className="size-full" role="img" aria-label="720 GYM" fill="#fff">
          <text x="43" y="83" className="marca" fontSize="54" textLength="64" lengthAdjust="spacingAndGlyphs">
            720
          </text>
          <text x="43.5" y="107" className="marca" fontSize="27" textLength="63" lengthAdjust="spacingAndGlyphs">
            GYM
          </text>
        </svg>
      )}
    </span>
  );
}
