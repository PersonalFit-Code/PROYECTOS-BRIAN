import { useId } from "react";

/*
 * Logo de BH Tacos redibujado en vectores a partir de su logo real (insignia redonda crema con aro
 * marrón, el taco con cuadrícula y queso fundido, banda «BH TACOS» y «TACOS FRANCESES» en arco).
 * En SVG para que salga nítido a cualquier tamaño; la letra es Poppins, la más parecida a la suya.
 */
export const LOGO_COLORS = {
  brown: "#7B2B19",
  rust: "#8A2E1A",
  orange: "#D9822B",
  amber: "#E39A35",
  tan: "#EDB66A",
  cream: "#F3E7D3",
} as const;

interface Props {
  className?: string;
  /** Solo el taco (favicon, botones pequeños): sin banda ni textos. */
  iconOnly?: boolean;
  title?: string;
}

export default function Logo({ className = "h-12 w-auto", iconOnly = false, title = "BH Tacos · Tacos franceses" }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const c = LOGO_COLORS;
  const taco = (
    <g>
      <clipPath id={`grid-${id}`}>
        <rect x="124" y="40" width="92" height="104" />
      </clipPath>
      <rect x="124" y="40" width="92" height="104" fill={c.tan} stroke={c.brown} strokeWidth="5" />
      {/* Cuadrícula de la plancha */}
      <g clipPath={`url(#grid-${id})`} stroke={c.brown} strokeWidth="3.2">
        {[-60, -30, 0, 30, 60, 90, 120].map((o) => (
          <g key={o}>
            <line x1={124 + o} y1="144" x2={124 + o + 104} y2="40" />
            <line x1={124 + o} y1="40" x2={124 + o + 104} y2="144" />
          </g>
        ))}
      </g>
      <rect x="204" y="40" width="12" height="104" fill={c.amber} opacity=".55" />
      {/* Queso fundido arriba, con goteo */}
      <path
        d="M118 44c0-10 8-14 18-14h70c10 0 16 4 18 10l4 8c2 6-2 9-7 6l-6-4c-4 6-6 18-12 18s-6-12-10-14c-5 10-7 22-14 22s-8-14-12-18c-4 6-8 10-14 8s-4-10-8-12c-4 4-6 6-11 6-6 0-8-6-8-10z"
        fill={c.amber}
        stroke={c.brown}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path d="M150 42c10-6 30-6 44 2" stroke={c.brown} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
    </g>
  );

  const a11y = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };

  if (iconOnly) {
    return (
      <svg viewBox="96 18 148 140" className={className} {...a11y}>
        {taco}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 340 330" className={className} {...a11y}>
      <defs>
        <path id={`arc-${id}`} d="M62 236 A118 118 0 0 0 278 236" />
      </defs>
      <circle cx="170" cy="166" r="156" fill={c.cream} stroke={c.brown} strokeWidth="7" />
      <circle cx="170" cy="166" r="136" fill="none" stroke={c.orange} strokeWidth="5" />
      {taco}
      {/* Cuenco bajo la banda */}
      <path d="M92 218h156a78 46 0 0 1-156 0z" fill={c.rust} stroke={c.orange} strokeWidth="7" />
      {/* Banda del nombre, más ancha que el círculo */}
      <rect x="6" y="146" width="328" height="72" rx="4" fill={c.cream} stroke={c.brown} strokeWidth="5" />
      <line x1="18" y1="156" x2="322" y2="156" stroke={c.brown} strokeWidth="3" />
      <line x1="18" y1="208" x2="322" y2="208" stroke={c.brown} strokeWidth="3" />
      <text x="170" y="198" textAnchor="middle" fontFamily="var(--font-logo), Poppins, 'Century Gothic', Futura, sans-serif" fontWeight="700" fontSize="54" letterSpacing="1">
        <tspan fill={c.rust}>BH </tspan>
        <tspan fill={c.orange}>TACOS</tspan>
      </text>
      <text fontFamily="var(--font-logo), Poppins, 'Century Gothic', Futura, sans-serif" fontWeight="600" fontSize="23" letterSpacing="2" fill={c.brown}>
        <textPath href={`#arc-${id}`} startOffset="50%" textAnchor="middle">
          TACOS FRANCESES
        </textPath>
      </text>
    </svg>
  );
}
