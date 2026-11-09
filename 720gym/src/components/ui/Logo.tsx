import { cn } from "@/lib/utils";

/**
 * Logo tipográfico PROVISIONAL de 720 GYM CLUB: «720 / GYM» en stencil y «CLUB» en sans redondeada,
 * como su logo. Se sustituye por el vectorial (SVG) en cuanto nos lo pasen
 * (comercial/720gym/marca/ → public/marca/).
 */
export default function Logo({ className, tono = "blanco" }: { className?: string; tono?: "blanco" | "negro" }) {
  return (
    <span
      className={cn("inline-flex items-end gap-1.5 leading-none select-none", tono === "blanco" ? "text-white" : "text-negro", className)}
      aria-label="720 GYM CLUB"
      role="img"
    >
      <span className="flex flex-col items-start">
        <span className="titular text-[1.9em] leading-[0.8]">720</span>
        <span className="titular text-[1.18em] leading-[0.9] tracking-[0.06em]">GYM</span>
      </span>
      <span className="mb-[0.12em] font-club text-[0.5em] font-black tracking-[0.18em]">CLUB</span>
    </span>
  );
}
