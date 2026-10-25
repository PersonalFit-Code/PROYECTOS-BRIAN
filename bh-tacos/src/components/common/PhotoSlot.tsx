import Image from "next/image";
import type { ReactNode } from "react";
import { PHOTOS, type PhotoSlot as SlotId } from "@/data/photos";
import { cn } from "@/lib/format";

interface Props {
  slot: SlotId;
  /** Qué enseñar mientras no haya foto (hoy, la ilustración SVG). */
  fallback: ReactNode;
  className?: string;
  /** Solo el hero: se carga con prioridad, sin lazy. */
  priority?: boolean;
  sizes?: string;
}

/**
 * Hueco de foto: si `photos.ts` tiene la foto real, la pinta con next/image (lazy, AVIF/WebP,
 * tamaños responsivos); si no, deja la ilustración de reserva. Así la web nunca se queda vacía.
 */
export default function PhotoSlot({ slot, fallback, className, priority, sizes = "(min-width: 1024px) 50vw, 100vw" }: Props) {
  const photo = PHOTOS[slot];
  if (!photo) return <>{fallback}</>;
  return (
    <div className={cn("relative overflow-hidden", className)}>
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
    </div>
  );
}
