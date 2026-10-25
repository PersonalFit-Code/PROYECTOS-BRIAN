import { cn } from "@/lib/format";

/**
 * Borde de papel rasgado entre dos secciones. Se pinta con el color de la sección que viene
 * DESPUÉS (`fill`), solapado sobre la anterior. Decorativo.
 */
export default function TornEdge({ fill = "var(--cream-bg)", flip = false, className }: { fill?: string; flip?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      className={cn("block h-6 w-full sm:h-9", flip && "rotate-180", className)}
      style={{ fill }}
    >
      <path d="M0 40V22l28-9 34 11 41-14 37 9 46-15 32 13 49-8 30 10 44-16 39 12 45-6 33 9 41-14 38 11 47-9 36 12 43-15 35 8 48-7 31 11 46-13 40 10 37-8 44 12 33-10 42 9 36-14 45 10 39-7 43 11 30-9 47 13 35-10 44 6 38-12 41 9 34-4V40z" />
    </svg>
  );
}
