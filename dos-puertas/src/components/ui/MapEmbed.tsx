import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/cn";

/**
 * Mapa de Google incrustado (sin clave de API), pasado a tema oscuro con un filtro para que case
 * con el azul tinta de la web. `loading="lazy"`: no se descarga hasta que se acerca a pantalla.
 */
export default function MapEmbed({ title, className }: { title: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-tinta-800", className)}>
      <iframe
        title={title}
        src={BUSINESS.mapEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 size-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.55)_brightness(0.92)_contrast(0.95)]"
      />
      <span aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(243,236,220,0.1),inset_0_0_40px_rgba(18,24,38,0.55)]" />
    </div>
  );
}
