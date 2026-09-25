import { cn } from "@/lib/utils";

export type LogoVariant = "full" | "wordmark" | "mark";

interface LogoProps {
  /** Altura en píxeles. La anchura se deriva de la proporción de cada variante. */
  size?: number;
  /** `full` = sartén + TIXOLA · `wordmark` = solo TIXOLA · `mark` = solo la sartén */
  variant?: LogoVariant;
  /** Color del texto (por defecto crema, hereda `currentColor`). */
  className?: string;
  /** Si es `true` el SVG es decorativo (p. ej. cuando va dentro de un enlace ya etiquetado). */
  decorative?: boolean;
}

/* Cajas de dibujo (viewBox) de cada variante — todas de 40 unidades de alto. */
const VIEWBOX: Record<LogoVariant, { w: number; h: number }> = {
  full: { w: 172, h: 40 },
  wordmark: { w: 124, h: 40 },
  mark: { w: 40, h: 40 },
};

/**
 * Glifo de la "tixola": sartén de hierro fundido vista desde arriba, mango a 45º y
 * dos hilos de vapor. Se dibuja en una caja de 40×40. Colores fijos de marca (pimentón/brasa).
 */
function PanGlyph() {
  return (
    <g>
      {/* mango */}
      <path d="M25.5 15.5 L36.5 4.5" stroke="#b21e27" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M27 14 L35.5 5.5" stroke="#d8323c" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      {/* cuerpo de la sartén */}
      <circle cx="16.5" cy="24" r="12" fill="#7d131a" />
      <circle cx="16.5" cy="24" r="10.4" fill="#b21e27" />
      <circle cx="16.5" cy="24" r="7.2" fill="#3a0e13" />
      {/* reflejo del aceite caliente */}
      <path d="M11.5 21.5a6.2 6.2 0 0 1 5.4-3.6" stroke="#ff6a3d" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
      {/* brasa central */}
      <circle cx="17.5" cy="25" r="1.6" fill="#ff6a3d" opacity="0.85" />
      {/* vapor */}
      <path
        d="M9 9.5c1.6-1.4 1.6-2.8 0-4.2M13.5 8c1.6-1.4 1.6-2.8 0-4.2"
        stroke="#e8c27a"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
    </g>
  );
}

/**
 * Palabra "TIXOLA" en Bebas Neue (font-condensed). `textLength` fija la anchura del texto para
 * que el logo no cambie de tamaño si la fuente web aún no ha cargado.
 */
function Wordmark({ x }: { x: number }) {
  return (
    <text
      x={x}
      y="33"
      fontSize="36"
      textLength="118"
      lengthAdjust="spacingAndGlyphs"
      fill="currentColor"
      style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', Impact, 'Arial Narrow', sans-serif", letterSpacing: "0.08em" }}
    >
      TIXOLA
    </text>
  );
}

/**
 * Logo de Tixola Tapería como SVG inline (sin peticiones extra, escala perfecta, hereda color).
 * Ejemplos: `<Logo />` en la navbar, `<Logo variant="mark" size={22} />` como favicon inline,
 * `<Logo variant="wordmark" size={48} className="text-cream/40" />` como marca de agua.
 */
export default function Logo({ size = 28, variant = "full", className, decorative = false }: LogoProps) {
  const { w, h } = VIEWBOX[variant];
  const width = Math.round((size * w) / h);
  const a11y = decorative ? { "aria-hidden": true as const } : { role: "img" as const, "aria-label": "Tixola Tapería" };

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={width}
      height={size}
      className={cn("shrink-0 text-cream", className)}
      {...a11y}
    >
      {!decorative && <title>Tixola Tapería</title>}
      {variant !== "wordmark" && <PanGlyph />}
      {variant !== "mark" && <Wordmark x={variant === "full" ? 50 : 3} />}
    </svg>
  );
}
