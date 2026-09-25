import { cn } from "@/lib/utils";

export type LogoVariant = "full" | "wordmark" | "mark" | "t";
export type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  /**
   * Tamaño responsive por nombre (`sm` 28 px · `md` 36→44 px · `lg` 48→56 px) o altura fija en píxeles.
   * Con un nombre la anchura se deriva por CSS (`w-auto` + viewBox); con un número se fijan width/height.
   */
  size?: LogoSize | number;
  /** `full` = sartén + TIXOLA · `wordmark` = solo TIXOLA · `mark` = solo la sartén · `t` = monograma "T" compacto */
  variant?: LogoVariant;
  /** Clases extra (el texto hereda `currentColor`; por defecto crema). */
  className?: string;
  /** `true` cuando el SVG es decorativo (p. ej. dentro de un enlace ya etiquetado). */
  decorative?: boolean;
}

/* Cajas de dibujo (viewBox) de cada variante — todas de 40 unidades de alto. */
const VIEWBOX: Record<LogoVariant, { w: number; h: number }> = {
  full: { w: 208, h: 40 },
  wordmark: { w: 160, h: 40 },
  mark: { w: 40, h: 40 },
  t: { w: 40, h: 40 },
};

/* Alturas responsive por nombre. La anchura la resuelve el navegador a partir del viewBox. */
const SIZE_CLASS: Record<LogoSize, string> = {
  sm: "h-7 w-auto",
  md: "h-9 w-auto md:h-11",
  lg: "h-12 w-auto md:h-14",
};

const CINZEL = "var(--font-cinzel), 'Cinzel', 'Trajan Pro', Georgia, serif";

/**
 * Glifo de la "tixola": sartén de hierro fundido vista desde arriba en pimentón, mango a 45º,
 * reflejo de aceite caliente, brasa central y dos hilos de vapor dorados. Caja 40×40.
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
 * Monograma "T" compacto: disco pimentón con borde dorado, la T en Cinzel y una brasa.
 * Pensado para avatares (chat), favicons inline y espacios muy pequeños. Caja 40×40.
 */
function TGlyph() {
  return (
    <g>
      <circle cx="20" cy="20" r="19" fill="#7d131a" />
      <circle cx="20" cy="20" r="17.4" fill="#b21e27" />
      <circle cx="20" cy="20" r="17.4" fill="none" stroke="#e8c27a" strokeOpacity="0.45" strokeWidth="1" />
      <text
        x="20"
        y="27.5"
        fontSize="22"
        fontWeight={600}
        textAnchor="middle"
        fill="#f9f6f0"
        style={{ fontFamily: CINZEL }}
      >
        T
      </text>
      <circle cx="28.5" cy="11.5" r="1.7" fill="#ff6a3d" opacity="0.9" />
    </g>
  );
}

/**
 * Palabra "TIXOLA" en Cinzel (font-caps), versalitas talladas con tracking amplio.
 * `textLength` fija la anchura para que el logo no salte mientras carga la fuente web.
 */
function Wordmark({ x }: { x: number }) {
  return (
    <text
      x={x}
      y="30.5"
      fontSize="27"
      fontWeight={600}
      textLength="152"
      lengthAdjust="spacingAndGlyphs"
      fill="currentColor"
      style={{ fontFamily: CINZEL, letterSpacing: "0.14em" }}
    >
      TIXOLA
    </text>
  );
}

/**
 * Logo de Tixola Tapería como SVG inline (sin peticiones extra, escala perfecta, hereda color).
 *  - `<Logo size="md" decorative />` en la navbar (36 px → 44 px en md)
 *  - `<Logo variant="mark" size={22} />` como icono
 *  - `<Logo variant="t" size="sm" />` monograma compacto
 *  - `<Logo variant="wordmark" size={48} className="text-cream/40" />` como marca de agua
 */
export default function Logo({ size = "md", variant = "full", className, decorative = false }: LogoProps) {
  const { w, h } = VIEWBOX[variant];
  const fixed = typeof size === "number";
  const a11y = decorative ? { "aria-hidden": true as const } : { role: "img" as const, "aria-label": "Tixola Tapería" };

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={fixed ? Math.round((size * w) / h) : undefined}
      height={fixed ? size : undefined}
      className={cn("shrink-0 text-cream", !fixed && SIZE_CLASS[size], className)}
      {...a11y}
    >
      {!decorative && <title>Tixola Tapería</title>}
      {variant === "t" && <TGlyph />}
      {(variant === "full" || variant === "mark") && <PanGlyph />}
      {(variant === "full" || variant === "wordmark") && <Wordmark x={variant === "full" ? 50 : 4} />}
    </svg>
  );
}

/** Atajo: monograma "T" compacto (mismo API que `<Logo variant="t" />`). */
export function TMark({ size = "sm", className, decorative = true }: Omit<LogoProps, "variant">) {
  return <Logo variant="t" size={size} className={className} decorative={decorative} />;
}
