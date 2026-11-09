import type { SVGProps } from "react";

/**
 * Iconos SVG propios para lo que Lucide no tiene (mismo trazo: 24×24, línea de 2 px, redondeada),
 * para submarcas, clubes y clases.
 */
type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, ...p });

/** Gimnasia acrobática: anillas */
export function Anillas(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M8 2v9M16 2v9" />
      <circle cx="8" cy="15" r="4" />
      <circle cx="16" cy="15" r="4" />
    </svg>
  );
}
/** BJJ: cinturón anudado */
export function Cinturon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M2 10h20" />
      <path d="M2 14h20" />
      <path d="M10 10l2 2 2-2M10 14l2-2 2 2" />
      <path d="M11 14l-2 7M13 14l2 7" />
    </svg>
  );
}
/** Capoeira: berimbau (arco + cabaza) */
export function Berimbau(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M6 2c7 5 7 15 0 20" />
      <path d="M6 2v20" />
      <circle cx="9.5" cy="17" r="3" />
      <path d="M15 8l5-3" />
    </svg>
  );
}
/** Powerlifting / halterofilia: barra con discos */
export function BarraDiscos(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M1 12h22" />
      <rect x="4" y="6" width="3" height="12" rx="1" />
      <rect x="17" y="6" width="3" height="12" rx="1" />
      <path d="M8 8v8M16 8v8" />
    </svg>
  );
}
/** Halterofilia: barra por encima de la cabeza */
export function Arrancada(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M2 5h20" />
      <path d="M4 3v4M20 3v4" />
      <circle cx="12" cy="9" r="1.5" />
      <path d="M7 5l5 6 5-6M12 11v5l-3 5M12 16l3 5" />
    </svg>
  );
}
/** Pilates Reformer: carro sobre raíles */
export function Reformer(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M2 17h20" />
      <path d="M4 17v3M20 17v3" />
      <rect x="8" y="12" width="7" height="3" rx="1" />
      <path d="M18 9v6M3 15h3" />
      <path d="M15 13.5l3-2" />
    </svg>
  );
}
/** 720P: llave de sala */
export function LlaveSala(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="8" cy="8" r="5" />
      <path d="M11.5 11.5L21 21M17 17l2-2M14.5 14.5l2-2" />
    </svg>
  );
}
/** Kettlebell (CrossGym) */
export function Kettlebell(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M8.5 9a3.5 3.5 0 1 1 7 0" />
      <path d="M7 9h10l1.5 3.5A7 7 0 1 1 5.5 12.5z" />
    </svg>
  );
}
