import type { Illustration } from "@/data/menu";
import { cn } from "@/lib/cn";

/**
 * Ilustraciones de la barra, mientras llegan las fotos reales. Plato azul tinta (el del rótulo) y
 * los pinchos en dorados y ámbar. Decorativas: el nombre va siempre en texto al lado.
 */
const BUN = "#d9a35f";
const BUN_DARK = "#a8702f";
const CRUST = "#e8b85a";

function Bollito({ y = 64 }: { y?: number }) {
  return (
    <g>
      <path d={`M30 ${y} Q30 ${y - 26} 60 ${y - 28} Q90 ${y - 26} 90 ${y} Z`} fill={BUN} />
      <path d={`M36 ${y - 14} Q60 ${y - 26} 84 ${y - 14}`} stroke="#f2cf8e" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d={`M30 ${y + 10} Q60 ${y + 18} 90 ${y + 10} L90 ${y + 6} L30 ${y + 6} Z`} fill={BUN_DARK} />
    </g>
  );
}

function Drawing({ kind }: { kind: Illustration }) {
  switch (kind) {
    case "chicharron":
      return (
        <g>
          {[
            "M34 66 L44 52 L58 56 L60 70 L46 76 Z",
            "M56 50 L70 42 L84 50 L80 64 L64 64 Z",
            "M62 70 L76 64 L88 72 L82 86 L66 84 Z",
            "M40 78 L54 76 L60 90 L46 94 L36 88 Z",
          ].map((d, i) => (
            <path key={i} d={d} fill={i % 2 ? "#b8702f" : "#cf8a3f"} stroke="#f0c37a" strokeOpacity={0.5} strokeWidth={1.2} strokeLinejoin="round" />
          ))}
          {[
            [48, 62],
            [72, 52],
            [74, 76],
            [48, 86],
          ].map(([cx, cy]) => (
            <circle key={`${cx}`} cx={cx} cy={cy} r={2} fill="#f6d79a" opacity={0.8} />
          ))}
        </g>
      );
    case "calamar":
      return (
        <g>
          <Bollito y={70} />
          {[42, 56, 70].map((cx) => (
            <ellipse key={cx} cx={cx + 4} cy={73} rx={9} ry={5} fill="none" stroke="#f6e0a6" strokeWidth={4} />
          ))}
        </g>
      );
    case "tortilla":
      return (
        <g>
          <path d="M28 76 L86 44 Q96 62 88 82 Z" fill={CRUST} />
          <path d="M34 75 L84 50 Q91 64 85 79 Z" fill="#f4d68a" />
          {[
            [60, 66],
            [72, 60],
            [76, 72],
            [52, 72],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.4} fill="#e2b25a" />
          ))}
        </g>
      );
    case "empanadilla":
      return (
        <g>
          <path d="M28 74 Q30 40 60 38 Q90 40 92 74 Z" fill="#dda552" />
          <path d="M28 74 Q60 82 92 74" stroke="#b87d35" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="1 6" />
          <path d="M42 56 Q60 46 78 56" stroke="#f2cf8e" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
      );
    case "rixon":
      return (
        <g>
          {[
            [38, 54],
            [56, 48],
            [72, 56],
            [46, 70],
            [64, 68],
            [80, 72],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={15} height={13} rx={3} fill={i % 2 ? "#c07a37" : "#d8964a"} stroke="#f0c37a" strokeOpacity={0.45} />
          ))}
        </g>
      );
    case "montado":
      return (
        <g>
          <rect x={30} y={62} width={60} height={18} rx={6} fill={BUN} />
          <rect x={32} y={54} width={56} height={10} rx={3} fill="#c96b5a" />
          <rect x={34} y={48} width={52} height={8} rx={3} fill="#f2d27a" />
          <rect x={30} y={78} width={60} height={4} rx={2} fill={BUN_DARK} />
        </g>
      );
    case "bocadillo":
      return (
        <g>
          <path d="M22 64 Q60 44 98 64 Q60 70 22 64 Z" fill={BUN} />
          <path d="M22 66 Q60 72 98 66 Q96 76 60 78 Q24 76 22 66 Z" fill={BUN_DARK} />
          <path d="M30 66 Q60 70 90 66" stroke="#f6e0a6" strokeWidth={4} fill="none" />
          {[40, 56, 72].map((x) => (
            <path key={x} d={`M${x} 56 l8 -4`} stroke="#f2cf8e" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
          ))}
        </g>
      );
    case "racion":
      return (
        <g>
          <ellipse cx={60} cy={64} rx={34} ry={22} fill="#e9e1cf" opacity={0.18} />
          {[
            [46, 58],
            [60, 54],
            [74, 60],
            [52, 70],
            [68, 72],
          ].map(([cx, cy]) => (
            <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={9} ry={5.5} fill="none" stroke="#f6e0a6" strokeWidth={4} />
          ))}
        </g>
      );
    case "copa":
      return (
        <g>
          <path d="M46 34 H74 Q76 62 60 66 Q44 62 46 34 Z" fill="none" stroke="#f3ecdc" strokeOpacity={0.7} strokeWidth={2} />
          <path d="M47 46 H73 Q73 62 60 64 Q47 62 47 46 Z" fill="#8e1f30" />
          <line x1={60} y1={66} x2={60} y2={86} stroke="#f3ecdc" strokeOpacity={0.7} strokeWidth={2} />
          <line x1={50} y1={88} x2={70} y2={88} stroke="#f3ecdc" strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    case "cana":
      return (
        <g>
          <path d="M44 38 H76 L72 88 H48 Z" fill="#e8a24a" opacity={0.92} />
          <path d="M42 34 Q50 26 58 32 Q66 24 74 32 Q80 30 78 40 H42 Z" fill="#f6efe0" />
          {[
            [54, 60],
            [64, 72],
            [58, 80],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.6} fill="#fff3d6" opacity={0.8} />
          ))}
          <path d="M44 38 H76 L72 88 H48 Z" fill="none" stroke="#f3ecdc" strokeOpacity={0.4} strokeWidth={1.5} />
        </g>
      );
  }
}

export default function PinchoArt({ kind, className }: { kind: Illustration; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn("block", className)}>
      <defs>
        <radialGradient id={`plato-${kind}`} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#2a3653" />
          <stop offset="1" stopColor="#151c2c" />
        </radialGradient>
      </defs>
      <circle cx={60} cy={62} r={50} fill={`url(#plato-${kind})`} stroke="#f3ecdc" strokeOpacity={0.12} />
      <circle cx={60} cy={62} r={40} fill="none" stroke="#e3c46a" strokeOpacity={0.18} />
      <ellipse cx={60} cy={92} rx={30} ry={5} fill="#000" opacity={0.25} />
      <Drawing kind={kind} />
    </svg>
  );
}
