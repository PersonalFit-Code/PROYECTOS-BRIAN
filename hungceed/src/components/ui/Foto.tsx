import { cn } from "@/lib/utils";

/**
 * Foto de hungceed.es cargada tal cual desde su web (maqueta: no se copian a este repositorio).
 * `<img>` normal a propósito: next/image tendría que descargarlas en el servidor y aquí solo hace
 * falta enseñarlas.
 */
export default function Foto({ src, alt, className, prioridad = false, contener = false }: { src: string; alt: string; className?: string; prioridad?: boolean; contener?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={prioridad ? "eager" : "lazy"}
      fetchPriority={prioridad ? "high" : undefined}
      decoding="async"
      className={cn("h-full w-full", contener ? "object-contain" : "object-cover", className)}
    />
  );
}
