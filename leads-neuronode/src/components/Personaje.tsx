import type { FichaPuesto } from "@/lib/oficina";

/**
 * Un agente sentado en su silla de oficina, de cintura para arriba, en un lienzo de 200×150 con el
 * centro en x=100. Proporciones de persona (cara alargada, cuello, hombros), ropa de oficina y
 * gesto neutro: dibujo, pero no muñeco.
 */
export function Busto({ f }: { f: FichaPuesto }) {
  const sombra = "rgb(0 0 0 / 0.14)";
  return (
    <>
      {/* Respaldo de la silla */}
      <rect x="71" y="40" width="58" height="72" rx="9" fill="#262041" />
      <rect x="75" y="44" width="50" height="64" rx="7" fill="#2f2850" />

      {/* Pelo largo por detrás de la cabeza */}
      {f.peinado === "melena" && <path d="M82 80 Q77 40 100 35 Q123 40 118 80 Z" fill={f.pelo} />}

      {/* Cuerpo: chaqueta, camisa y solapas */}
      <path d="M64 120 L67 99 Q69 87 85 84 L115 84 Q131 87 133 99 L136 120 Z" fill={f.camiseta} />
      <path d="M91 84 L100 98 L109 84 Z" fill="#ece9f4" />
      <path d="M91 84 L100 98 L95 120 M109 84 L100 98 L105 120" stroke={sombra} strokeWidth="1.6" fill="none" />
      <path d="M78 104 L80 120 M122 104 L120 120" stroke={sombra} strokeWidth="1.4" fill="none" />

      {/* Cuello y sombra bajo la barbilla */}
      <rect x="94" y="68" width="12" height="18" rx="3" fill={f.piel} />
      <rect x="94" y="70" width="12" height="5" fill={sombra} />

      {/* Orejas y cara */}
      <ellipse cx="85" cy="57" rx="2.6" ry="4.2" fill={f.piel} />
      <ellipse cx="115" cy="57" rx="2.6" ry="4.2" fill={f.piel} />
      <ellipse cx="100" cy="55" rx="14.5" ry="18" fill={f.piel} />
      <path d="M106 39 Q115 46 114 58 Q113 68 104 72 Q110 62 108 52 Z" fill="rgb(0 0 0 / 0.06)" />

      {/* Pelo */}
      {f.peinado === "corto" && <path d="M85.5 52 Q84 36 100 35 Q116 36 114.5 52 Q113 43 103 42 Q92 42 85.5 52 Z" fill={f.pelo} />}
      {f.peinado === "melena" && <path d="M85.5 54 Q87 38 100 37.5 Q113 38 114.5 54 Q109 44 99 45 Q90 46 85.5 54 Z" fill={f.pelo} />}
      {f.peinado === "rizo" && (
        <g fill={f.pelo}>
          <path d="M85 50 Q85 35 100 34.5 Q115 35 115 50 Q112 42 100 42 Q88 42 85 50 Z" />
          {[87, 92, 97, 102, 107, 112].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 37 : 39} r="4.2" />
          ))}
        </g>
      )}
      {f.peinado === "mono" && (
        <g fill={f.pelo}>
          <ellipse cx="100" cy="33" rx="7" ry="5.5" />
          <path d="M85.5 53 Q85 37 100 37 Q115 37 114.5 53 Q111 43 100 43 Q89 43 85.5 53 Z" />
        </g>
      )}
      {f.peinado === "barba" && (
        <g fill={f.pelo}>
          <path d="M86 49 Q86 36 100 36 Q114 36 114 49 Q110 42 100 42 Q90 42 86 49 Z" />
          <path d="M86.5 59 Q87 73 100 74.5 Q113 73 113.5 59 Q110 67 104 66.5 L96 66.5 Q90 67 86.5 59 Z" opacity="0.92" />
        </g>
      )}

      {/* Cejas, ojos, nariz y boca: gesto neutro */}
      <path d="M91 50.5 L97 50 M103 50 L109 50.5" stroke={f.pelo} strokeWidth="1.7" strokeLinecap="round" />
      <ellipse cx="94.5" cy="55" rx="1.7" ry="1.3" fill="#1d1a2b" />
      <ellipse cx="105.5" cy="55" rx="1.7" ry="1.3" fill="#1d1a2b" />
      <path d="M100.5 56.5 L99 62 L101.5 62" stroke="rgb(0 0 0 / 0.2)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M96.5 66 Q100 67.2 103.5 66" stroke="#8a4f42" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </>
  );
}
