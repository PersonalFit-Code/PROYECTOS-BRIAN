import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Foto real o hueco elegante con su descripción. Regla del proyecto: nada de fotos de banco que
 * parezcan de otro gimnasio. Cuando lleguen sus fotos (Instagram @720gym), se dejan en
 * public/fotos/ y se pasa `src="/fotos/…"`.
 *
 * `bn`: blanco y negro (encaja con la marca: fotos en B/N con un toque de acento).
 */
export default function Foto({
  src,
  alt,
  descripcion,
  proporcion = "aspect-[4/3]",
  tono = "oscuro",
  bn = false,
  className,
  prioridad = false,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  posicion = "abajo",
}: {
  src?: string;
  alt?: string;
  descripcion: string;
  proporcion?: string;
  tono?: "oscuro" | "claro" | "crema";
  bn?: boolean;
  className?: string;
  prioridad?: boolean;
  sizes?: string;
  /** Dónde va la descripción del hueco (en los collages, donde no la tape otra foto). */
  posicion?: "abajo" | "arriba-izq" | "arriba-der";
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden", proporcion, className)}>
        <Image
          src={src}
          alt={alt ?? descripcion}
          fill
          sizes={sizes}
          priority={prioridad}
          className={cn("object-cover", bn && "grayscale")}
        />
      </div>
    );
  }
  const estilos = {
    oscuro: "bg-suelo text-white/55 hueco-rayado ring-1 ring-inset ring-white/8",
    claro: "bg-[#e9e9e7] text-negro/50 hueco-rayado-claro ring-1 ring-inset ring-black/6",
    crema: "bg-crema-2 text-carbon/55 hueco-rayado-claro ring-1 ring-inset ring-black/6",
  }[tono];
  return (
    <div
      className={cn(
        "relative flex overflow-hidden",
        posicion === "abajo" ? "items-end" : "items-start pt-6",
        posicion === "arriba-der" && "justify-end text-right",
        proporcion,
        estilos,
        className,
      )}
      role="img"
      aria-label={`Foto pendiente: ${descripcion}`}
    >
      <span className={cn("pointer-events-none absolute etiqueta !text-[9px] opacity-70", posicion === "abajo" ? "top-3 right-3" : "bottom-3 left-3")}>Foto pendiente</span>
      <div className={cn("flex items-start gap-2 p-4 text-[12px] leading-snug", posicion !== "abajo" && "max-w-[62%]")}>
        <Camera className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="max-w-[28ch]">{descripcion}</span>
      </div>
    </div>
  );
}
