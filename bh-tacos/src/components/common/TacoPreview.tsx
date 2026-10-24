import { useId } from "react";
import { MENU, getSize, type SizeId, type StyleId } from "@/data/menu";

interface Props {
  style: StyleId;
  size: SizeId;
  meats?: string[];
  sauces?: string[];
  extras?: string[];
  className?: string;
  /** Texto alternativo; si no se pasa, el SVG es decorativo. */
  label?: string;
}

/* Patatas internas: posiciones fijas para que el dibujo sea estable entre renders. */
const FRIES = [
  [62, 128, -8], [86, 132, 6], [110, 127, -4], [134, 133, 9], [158, 128, -6], [182, 131, 4], [206, 127, -9], [230, 132, 7], [254, 128, -3],
] as const;

/**
 * El taco en corte lateral, por capas: tortilla abajo, patatas, carne, salsa, tortilla arriba y,
 * si toca, gratinado. Cambia con cada elección del configurador:
 *  - Rebozado → capa exterior dorada con miga.  · Tamaño → escala.
 *  - Carnes → trozos con su color.  · Salsas → goteos del color de cada una.  · Extras → queso fundido.
 * Las capas cambian con transiciones de opacidad/transform (interrumpibles, sin keyframes).
 */
export default function TacoPreview({ style, size, meats = [], sauces = [], extras = [], className, label }: Props) {
  /* IDs únicos por dibujo: si dos SVG comparten id de degradado y el primero está oculto
     (display: none), el navegador deja sin relleno al segundo. */
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const ids = { tortilla: `tp-tortilla-${uid}`, crumb: `tp-crumb-${uid}`, dots: `tp-dots-${uid}` };
  const scale = getSize(size).scale;
  const rebozado = style === "rebozado";
  const meatColors = meats.map((id) => MENU.meats.find((m) => m.id === id)?.color ?? "#9b5a35");
  const sauceColors = sauces.map((id) => MENU.sauces.find((s) => s.id === id)?.color ?? "#f4b53f");
  const gratin = extras.map((id) => MENU.extras.find((e) => e.id === id)?.color).filter((c): c is string => Boolean(c));
  const chunks = meatColors.length ? meatColors : ["#6b5b52"];

  return (
    <svg
      viewBox="0 0 320 240"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={ids.tortilla} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7C98A" />
          <stop offset="1" stopColor="#E19A52" />
        </linearGradient>
        <linearGradient id={ids.crumb} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B640" />
          <stop offset="1" stopColor="#B8701F" />
        </linearGradient>
        <pattern id={ids.dots} width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="#8C4F12" opacity=".55" />
          <circle cx="6.5" cy="6" r="1.1" fill="#FFE2A0" opacity=".7" />
        </pattern>
      </defs>

      {/* Sombra en el plato */}
      <ellipse cx="160" cy="214" rx={118 * scale} ry="10" fill="#000" opacity=".28" />

      <g style={{ transform: `scale(${scale})`, transformOrigin: "160px 210px", transition: "transform 320ms cubic-bezier(0.23, 1, 0.32, 1)" }}>
        {/* Rebozado: capa exterior dorada y crujiente */}
        <g style={{ opacity: rebozado ? 1 : 0, transition: "opacity 200ms ease" }}>
          <rect x="30" y="72" width="260" height="128" rx="40" fill={`url(#${ids.crumb})`} />
          <rect x="30" y="72" width="260" height="128" rx="40" fill={`url(#${ids.dots})`} />
        </g>

        {/* Tortilla inferior con marcas de plancha */}
        <rect x="40" y="148" width="240" height="44" rx="22" fill={`url(#${ids.tortilla})`} />
        <path d="M70 182l14-12m26 12l14-12m26 12l14-12m26 12l14-12m26 12l14-12" stroke="#A65A22" strokeWidth="4" strokeLinecap="round" opacity=".55" />

        {/* Patatas fritas internas */}
        {FRIES.map(([x, y, r], i) => (
          <rect key={i} x={x - 4} y={y} width="9" height="30" rx="3" fill="#FFD166" stroke="#E2A93B" strokeWidth="1.5" transform={`rotate(${r} ${x} ${y + 15})`} />
        ))}

        {/* Carne: trozos con el color de cada carne elegida */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect
            key={`m${i}`}
            x={52 + i * 32}
            y={i % 2 ? 112 : 108}
            width="30"
            height="20"
            rx="9"
            fill={chunks[i % chunks.length]}
            opacity={meatColors.length ? 1 : 0.35}
            style={{ transition: "fill 200ms ease, opacity 200ms ease" }}
          />
        ))}

        {/* Salsa quesera base (siempre) */}
        <path d="M44 106c30-10 60 8 90-2s60 8 90-2 44 6 52 2v10H44z" fill="#FFC94A" opacity=".95" />

        {/* Tortilla superior */}
        <path d="M40 104c0-18 14-30 32-30h176c18 0 32 12 32 30v4H40z" fill={`url(#${ids.tortilla})`} />
        <path d="M86 92l12-10m30 10l12-10m30 10l12-10m30 10l12-10" stroke="#A65A22" strokeWidth="4" strokeLinecap="round" opacity=".45" />

        {/* Gratinado: queso fundido por encima, con hilos que caen */}
        {gratin.map((c, i) => (
          <g key={c + i} className="enter-up">
            <path d={`M${58 + i * 10} ${80 - i * 4}c20-14 50-6 70-10s46-8 70-2 40 2 56 10l2 8c-22-4-40 4-62 2s-48 6-72 2-40-2-64 4z`} fill={c} stroke="#E8C66B" strokeWidth="1.5" />
            <path d={`M${96 + i * 30} ${84 - i * 4}q3 16 0 22`} stroke={c} strokeWidth="7" strokeLinecap="round" />
          </g>
        ))}

        {/* Salsas elegidas: goteo por el lateral (cada una con su color) */}
        {sauceColors.map((c, i) => (
          <g key={c + i} transform={`translate(${i ? 238 : 82} 136)`}>
            <path className="anim-drip" d="M0 0c-6 0-8 6-8 12 0 10 8 22 8 30 0-8 8-20 8-30 0-6-2-12-8-12z" fill={c} stroke="#00000022" />
            <circle cx="0" cy="62" r="5" fill={c} className="anim-float" />
          </g>
        ))}
      </g>

      {/* Vapor: microanimación de ambiente */}
      {[120, 160, 200].map((x, i) => (
        <path
          key={x}
          className="anim-sizzle"
          style={{ animationDelay: `${i * 0.6}s`, transformBox: "fill-box" }}
          d={`M${x} 60c-6-8 6-14 0-22`}
          stroke="currentColor"
          strokeOpacity=".35"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
