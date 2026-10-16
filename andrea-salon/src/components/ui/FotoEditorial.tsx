import Image from "next/image";
import type { Foto } from "@/data/fotos";
import { cn } from "@/lib/utils";

/**
 * Una foto de la línea editorial, o su marco mientras no haya foto real: fondo nude claro, filete
 * interior y el monograma en la didona de titulares. Así la maqueta se ve terminada sin fotos (nada de
 * «Foto pendiente» en rosa) y, al llegar las fotos, solo cambia `data/fotos.ts`.
 *
 * La forma (aspect-ratio) la pone quien lo usa con `className`; la imagen la llena con `object-cover`.
 * `zoom`: la foto entra con un acercamiento lento (solo con movimiento permitido).
 */
export default function FotoEditorial({
  foto,
  className,
  sizes,
  priority = false,
  zoom = false,
  rotulo,
}: {
  foto: Foto;
  className?: string;
  sizes: string;
  priority?: boolean;
  zoom?: boolean;
  /** Texto pequeño del marco vacío (p. ej. «Manicura rusa»). */
  rotulo?: string;
}) {
  if (!foto.pendiente) {
    return (
      <div className={cn("relative overflow-hidden bg-nude-claro", className)}>
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", zoom && "motion-safe:animate-[zoom-lento_14s_var(--ease-out-expo)_both]")}
        />
      </div>
    );
  }
  return (
    <div role="img" aria-label={foto.alt} className={cn("relative overflow-hidden bg-nude-claro", className)}>
      <div aria-hidden className="absolute inset-3 border border-nude sm:inset-5" />
      <div aria-hidden className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-6xl text-nude sm:text-7xl">A</p>
          {rotulo && <p className="etiqueta mt-3 text-carmin-suave">{rotulo}</p>}
        </div>
      </div>
    </div>
  );
}
