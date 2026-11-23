import Image from "next/image";
import Logo from "./Logo";
import { cn } from "@/lib/utils";

/**
 * Logo de la disciplina o del club en su recuadro negro (los logos que pasó Brais, blanco sobre
 * negro). Sin logo propio, el de 720 GYM CLUB.
 */
export default function SelloConcepto({ logo, nombre, className }: { logo?: string; nombre: string; className?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden bg-black ring-1 ring-white/15", className)}>
      {logo ? (
        <Image src={logo} alt={`Logo de ${nombre}`} fill sizes="80px" className="object-cover" />
      ) : (
        <Logo className="text-[0.36em]" />
      )}
    </span>
  );
}
