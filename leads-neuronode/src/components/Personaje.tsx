import type { FichaPuesto } from "@/lib/oficina";

/** Un puesto de la oficina: la mesa, el portátil y su personaje. Las animaciones van en globals.css. */
export function Personaje({ f, activo }: { f: FichaPuesto; activo: boolean }) {
  return (
    <svg viewBox="0 0 200 150" className="puesto-svg mx-auto block w-full max-w-48" data-activo={activo ? "si" : "no"} aria-hidden>
      {/* Silla */}
      <rect x="68" y="52" width="64" height="62" rx="12" fill="#d9d4ee" />
      {/* Cuerpo */}
      <g className="p-cuerpo">
        <path d="M70 118 Q70 84 100 84 Q130 84 130 118 Z" fill={f.camiseta} />
        <rect x="93" y="74" width="14" height="14" rx="5" fill={f.piel} />
        {/* Cabeza */}
        <g className="p-cabeza">
          <circle cx="100" cy="58" r="20" fill={f.piel} />
          {f.peinado === "corto" && <path d="M80 56 Q80 36 100 36 Q120 36 120 56 Q112 46 100 46 Q88 46 80 56 Z" fill={f.pelo} />}
          {f.peinado === "melena" && <path d="M78 76 Q74 36 100 35 Q126 36 122 76 L116 76 Q120 50 100 47 Q80 50 84 76 Z" fill={f.pelo} />}
          {f.peinado === "rizo" && (
            <g fill={f.pelo}>
              <circle cx="84" cy="46" r="9" />
              <circle cx="96" cy="39" r="10" />
              <circle cx="109" cy="40" r="10" />
              <circle cx="118" cy="49" r="8" />
            </g>
          )}
          {f.peinado === "mono" && (
            <g fill={f.pelo}>
              <circle cx="100" cy="32" r="9" />
              <path d="M80 58 Q78 38 100 38 Q122 38 120 58 Q112 47 100 47 Q88 47 80 58 Z" />
            </g>
          )}
          {f.peinado === "gorra" && (
            <g>
              <path d="M80 54 Q80 36 100 36 Q120 36 120 54 Z" fill={f.pelo} />
              <rect x="78" y="50" width="52" height="6" rx="3" fill={f.pelo} />
            </g>
          )}
          <g className="p-ojos" fill="#15131f">
            <circle cx="92" cy="60" r="2.4" />
            <circle cx="108" cy="60" r="2.4" />
          </g>
          <path d="M94 68 Q100 72 106 68" stroke="#15131f" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      </g>
      {/* Mesa */}
      <rect x="14" y="112" width="172" height="10" rx="5" fill="#b9a98f" />
      <rect x="26" y="122" width="8" height="26" fill="#9c8c73" />
      <rect x="166" y="122" width="8" height="26" fill="#9c8c73" />
      {/* Portátil, visto por detrás */}
      <rect x="72" y="84" width="56" height="30" rx="5" fill="#2a2740" />
      <circle className="p-luz" cx="100" cy="99" r="4" fill="#6447fa" />
      {/* Manos */}
      <circle className="p-mano p-mano-i" cx="64" cy="110" r="6" fill={f.piel} />
      <circle className="p-mano p-mano-d" cx="136" cy="110" r="6" fill={f.piel} />
      {/* Taza */}
      <rect x="150" y="100" width="12" height="13" rx="3" fill="#ffffff" stroke="#d9d4ee" strokeWidth="2" />
    </svg>
  );
}
