import { cn } from "@/lib/utils";

/**
 * Logo tipográfico de 720 GYM CLUB en SVG (nítido a cualquier tamaño): «720» y «GYM» en stencil,
 * con «GYM» ajustado exactamente al ancho de «720», y «CLUB» espaciado y alineado con la base de
 * «GYM», como su logo. PROVISIONAL hasta tener el vectorial oficial (public/marca/).
 */
export default function Logo({ className, tono = "blanco" }: { className?: string; tono?: "blanco" | "negro" }) {
  return (
    <span className={cn("inline-flex leading-none select-none", tono === "blanco" ? "text-white" : "text-negro", className)} role="img" aria-label="720 GYM CLUB">
      <svg viewBox="0 0 118 62" className="h-[2.6em] w-auto overflow-visible" fill="currentColor" aria-hidden>
        <text x="0" y="35" className="marca" fontSize="44" textLength="74" lengthAdjust="spacingAndGlyphs">
          720
        </text>
        <text x="0.5" y="61" className="marca" fontSize="27" textLength="73" lengthAdjust="spacingAndGlyphs">
          GYM
        </text>
        <rect x="79" y="40" width="1.6" height="21" opacity="0.45" />
        <text x="85" y="61" fontFamily="var(--font-sans), sans-serif" fontWeight="800" fontSize="10.5" letterSpacing="2.2">
          CLUB
        </text>
      </svg>
    </span>
  );
}
