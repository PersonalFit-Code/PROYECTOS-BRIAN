import { cn } from "@/lib/utils";

/** Formas geométricas de su dosier de 720 Pilates: círculos, triángulos, puntos y líneas. */
export default function Geometria({ className }: { className?: string }) {
  return (
    <svg className={cn("pointer-events-none absolute", className)} viewBox="0 0 600 600" fill="none" aria-hidden>
      <circle cx="470" cy="120" r="90" fill="#F6A33B" opacity="0.9" />
      <circle cx="470" cy="120" r="130" stroke="#2E2E30" strokeOpacity="0.15" />
      <path d="M80 520 L200 320 L320 520 Z" fill="#3FBF9B" opacity="0.85" />
      <circle cx="150" cy="140" r="34" stroke="#3FBF9B" strokeWidth="6" />
      {Array.from({ length: 5 }, (_, f) =>
        Array.from({ length: 5 }, (_, c) => <circle key={`${f}-${c}`} cx={380 + c * 22} cy={380 + f * 22} r="3.5" fill="#2E2E30" opacity="0.35" />),
      )}
      <path d="M40 300 H160 M40 318 H120" stroke="#2E2E30" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
      <path d="M520 470 q30 -30 60 0 t60 0" stroke="#F6A33B" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
