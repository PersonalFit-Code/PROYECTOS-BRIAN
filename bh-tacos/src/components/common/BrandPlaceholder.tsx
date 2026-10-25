import Logo from "@/components/common/Logo";
import { cn } from "@/lib/format";

/**
 * Lo que se ve donde todavía no hay foto: papel crema con las marcas de la plancha y el taco del
 * logo. Mejor una marca limpia que un dibujo de comida que no convence.
 */
export default function BrandPlaceholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative grid h-full w-full place-items-center overflow-hidden bg-logo-cream", className)}
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(123,43,25,.10) 0 3px, transparent 3px 26px), repeating-linear-gradient(-45deg, rgba(123,43,25,.10) 0 3px, transparent 3px 26px)",
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <Logo iconOnly title="" className="h-14 w-auto drop-shadow-md sm:h-16" />
        {label && <span className="font-display text-lg uppercase tracking-wide text-cocoa">{label}</span>}
      </div>
    </div>
  );
}
