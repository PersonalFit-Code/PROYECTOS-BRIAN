"use client";

import { useEffect, useRef, useState } from "react";

/**
 * «720» que llena exactamente su recuadro (de arriba abajo, centrado): se mide la letra con
 * getBBox y el viewBox del SVG se ajusta a ella. Se vuelve a medir cuando carga la fuente.
 */
export default function MarcaAjustada({ texto = "720", className }: { texto?: string; className?: string }) {
  const ref = useRef<SVGTextElement>(null);
  const [vb, setVb] = useState("0 0 300 120");
  useEffect(() => {
    const medir = () => {
      const b = ref.current?.getBBox();
      if (b && b.width && b.height) {
        /* El bbox incluye ascendentes/descendentes de la fuente; se recorta a la altura de las cifras. */
        const alto = b.height * 0.74;
        const y = b.y + b.height * 0.13;
        setVb(`${b.x} ${y} ${b.width} ${alto}`);
      }
    };
    medir();
    document.fonts?.ready.then(medir).catch(() => {});
  }, []);
  return (
    <svg className={className} viewBox={vb} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <linearGradient id="marca-ajustada" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <text ref={ref} x="0" y="100" fontSize="140" className="marca" fill="url(#marca-ajustada)">
        {texto}
      </text>
    </svg>
  );
}
