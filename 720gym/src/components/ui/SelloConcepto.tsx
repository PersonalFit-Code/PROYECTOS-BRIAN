import Image from "next/image";
import { cn } from "@/lib/utils";
import { TRAZO_720GYM } from "./Logo";

/**
 * Logo de la disciplina o del club en su recuadro negro (los logos que pasó Brais, blanco sobre
 * negro, todos de 150 × 150). Sin logo propio, «720GYM» con las letras reales del rótulo, ocupando
 * el mismo ancho que los demás para que todos pesen igual en el recuadro.
 */
export default function SelloConcepto({ logo, nombre, className, sizes = "96px" }: { logo?: string; nombre: string; className?: string; sizes?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden bg-black ring-1 ring-white/15", className)}>
      {logo ? (
        <Image src={logo} alt={`Logo de ${nombre}`} fill sizes={sizes} className="object-cover" />
      ) : (
        <svg viewBox="-80 -353 1160 1000" className="size-full" role="img" aria-label="720 GYM" fill="#fff">
          <path fillRule="evenodd" d={TRAZO_720GYM} />
        </svg>
      )}
    </span>
  );
}
