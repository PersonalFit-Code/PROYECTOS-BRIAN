import Image from "next/image";
import { PHOTOS, type PhotoSlot as SlotId } from "@/data/photos";
import { cn } from "@/lib/format";
import BrandPlaceholder from "@/components/common/BrandPlaceholder";

interface Props {
  slot: SlotId;
  /** Tamaño y forma del hueco (el contenedor; la foto lo llena). */
  className?: string;
  /** Texto del bloque de marca mientras no haya foto. */
  label?: string;
  /** Solo la portada: se carga con prioridad, sin lazy. */
  priority?: boolean;
  sizes?: string;
}

/**
 * Hueco de foto: con foto en `photos.ts`, next/image (lazy, AVIF/WebP, tamaños responsivos, blur
 * mientras carga); sin foto, el bloque de marca. La web nunca se queda con un hueco vacío.
 */
export default function PhotoSlot({ slot, className, label, priority, sizes = "(min-width: 1024px) 40vw, 100vw" }: Props) {
  const photo = PHOTOS[slot];
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          className="object-cover"
          style={{ objectPosition: photo.position ?? "50% 50%" }}
        />
      ) : (
        <BrandPlaceholder label={label} />
      )}
    </div>
  );
}
