import { cn } from "@/lib/utils";

/**
 * Líneas onduladas del fondo de su dosier. SVG puro, se desliza en horizontal (la pista mide el
 * doble y se repite), sin JavaScript.
 */
export default function Ondas({ className, lineas = 14, color = "rgb(255 255 255 / 0.09)" }: { className?: string; lineas?: number; color?: string }) {
  const ancho = 1600;
  const paths = Array.from({ length: lineas }, (_, i) => {
    const y = 40 + i * (520 / lineas);
    const a = 26 + (i % 4) * 9;
    const fase = i * 37;
    let d = `M 0 ${y.toFixed(1)}`;
    for (let x = 0; x <= ancho * 2; x += 100) {
      const cy = y + Math.sin((x + fase) / 160) * a;
      d += ` L ${x} ${cy.toFixed(1)}`;
    }
    return d;
  });
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <svg
        className="ondas-pista absolute top-1/2 left-0 h-[130%] w-[200%] -translate-y-1/2"
        viewBox={`0 0 ${ancho * 2} 600`}
        preserveAspectRatio="none"
        fill="none"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} stroke={color} strokeWidth={1.2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        ))}
      </svg>
    </div>
  );
}
