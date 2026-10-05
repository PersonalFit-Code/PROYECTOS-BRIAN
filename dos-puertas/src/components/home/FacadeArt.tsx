"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * La fachada de la rúa dos Fornos, 7: el rótulo azul tinta con las letras doradas iluminado desde
 * abajo, las dos puertas con la luz de la barra dentro y la pizarra de precios entre ellas (tal como
 * está en la foto pública de Google de 2025). Es SVG y CSS: pesa unos kB y no depende de fotos.
 *
 * `luz` (0-1) sale del estado real: abierto → 1, cerrado → luz baja. Las chispas se pausan cuando la
 * portada sale de pantalla.
 */
const SPARKS = [
  { x: 72, y: 230, dx: -8, dur: 5.2, delay: 0.4 },
  { x: 108, y: 250, dx: 10, dur: 6.1, delay: 2.1 },
  { x: 292, y: 236, dx: 6, dur: 5.6, delay: 1.2 },
  { x: 330, y: 262, dx: -10, dur: 6.4, delay: 3.3 },
  { x: 150, y: 128, dx: 4, dur: 4.8, delay: 0.9 },
  { x: 250, y: 126, dx: -6, dur: 5.1, delay: 2.7 },
];

const BOLLOS = [48, 63, 78, 93, 108, 123];

function Door({ x, people }: { x: number; people: "one" | "two" }) {
  const cx = x + 56;
  return (
    <g>
      {/* Hueco oscuro de fondo: lo que se ve si la luz está apagada. */}
      <rect x={x} y={168} width={112} height={272} fill="#140e0b" />
      <g className="puerta-interior">
        <rect x={x} y={168} width={112} height={272} fill="url(#dp-interior)" />
        {/* Lámpara colgante */}
        <line x1={cx} y1={168} x2={cx} y2={198} stroke="#3b2a1c" strokeWidth={1.5} />
        <circle cx={cx} cy={210} r={34} fill="url(#dp-halo)" />
        <path d={`M${cx - 11} 208 Q${cx} 194 ${cx + 11} 208 Z`} fill="#2b1d14" />
        <circle cx={cx} cy={210} r={4} fill="#fff4d6" />
        {/* Gente tapeando de pie */}
        {people === "one" ? (
          <g fill="#1d130d" opacity={0.92}>
            <circle cx={x + 80} cy={292} r={11} />
            <path d={`M${x + 64} 440 L${x + 66} 322 Q${x + 80} 304 ${x + 94} 322 L${x + 98} 440 Z`} />
          </g>
        ) : (
          <g fill="#1d130d" opacity={0.92}>
            <circle cx={x + 34} cy={298} r={10.5} />
            <path d={`M${x + 18} 440 L${x + 21} 326 Q${x + 34} 310 ${x + 47} 326 L${x + 50} 440 Z`} />
            <circle cx={x + 80} cy={290} r={11} />
            <path d={`M${x + 64} 440 L${x + 66} 320 Q${x + 80} 302 ${x + 94} 320 L${x + 97} 440 Z`} />
            {/* La caña en la mano */}
            <rect x={x + 54} y={330} width={7} height={13} rx={1.5} fill="#e8a24a" opacity={0.9} />
          </g>
        )}
        {/* Barra de acero con los bollitos encima */}
        {people === "one" ? (
          <g>
            <rect x={x} y={360} width={112} height={80} fill="#24170f" />
            <rect x={x} y={356} width={112} height={5} fill="#c9ccd1" opacity={0.85} />
            {BOLLOS.map((bx) => (
              <ellipse key={bx} cx={x - 34 + bx} cy={352} rx={6.5} ry={4.2} fill="#d9a35f" />
            ))}
          </g>
        ) : null}
      </g>
      {/* Jambas y dintel de granito */}
      <g fill="none" stroke="#5b5d63" strokeWidth={10}>
        <path d={`M${x - 5} 440 V163 H${x + 117} V440`} />
      </g>
      <g stroke="#2a2c31" strokeWidth={1.2}>
        {[210, 262, 314, 366, 418].map((y) => (
          <g key={y}>
            <line x1={x - 10} y1={y} x2={x} y2={y} />
            <line x1={x + 112} y1={y} x2={x + 122} y2={y} />
          </g>
        ))}
        <line x1={x + 40} y1={158} x2={x + 40} y2={168} />
        <line x1={x + 76} y1={158} x2={x + 76} y2={168} />
      </g>
    </g>
  );
}

export default function FacadeArt({ luz, label }: { luz: number; label: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("puertas-pausa", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={ref} viewBox="0 -50 400 510" role="img" aria-label={label} className="block h-auto w-full">
      <defs>
        <linearGradient id="dp-muro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3038" />
          <stop offset="1" stopColor="#1b1e25" />
        </linearGradient>
        <radialGradient id="dp-interior" cx="50%" cy="38%" r="75%">
          <stop offset="0" stopColor="#ffd894" />
          <stop offset="0.32" stopColor="#e8a24a" />
          <stop offset="0.7" stopColor="#8f4c22" />
          <stop offset="1" stopColor="#3a2014" />
        </radialGradient>
        <radialGradient id="dp-halo">
          <stop offset="0" stopColor="#fff1c9" stopOpacity={0.9} />
          <stop offset="0.4" stopColor="#ffd894" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffd894" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="dp-oro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8e7ad" />
          <stop offset="0.55" stopColor="#e3c46a" />
          <stop offset="1" stopColor="#c08f3e" />
        </linearGradient>
        <linearGradient id="dp-luz-rotulo" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity={0.42} />
          <stop offset="0.6" stopColor="#ffcf7a" stopOpacity={0.06} />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="dp-derrame">
          <stop offset="0" stopColor="#e8a24a" stopOpacity={0.55} />
          <stop offset="0.5" stopColor="#e8a24a" stopOpacity={0.18} />
          <stop offset="1" stopColor="#e8a24a" stopOpacity={0} />
        </radialGradient>
        <filter id="dp-grano" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.16" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* Muro de granito con sus hiladas */}
      <rect y={-50} width={400} height={510} fill="url(#dp-muro)" />
      <rect y={-50} width={400} height={510} filter="url(#dp-grano)" />
      <g stroke="#3a3d45" strokeWidth={1}>
        {[-24, 22, 140, 200, 260, 320, 380].map((y) => (
          <line key={y} x1={0} y1={y} x2={400} y2={y} />
        ))}
        {[
          [120, -50, -24],
          [280, -50, -24],
          [60, -24, 22],
          [210, -24, 22],
          [330, -24, 22],
          [12, 140, 200],
          [200, 140, 200],
          [388, 140, 200],
          [150, 200, 260],
          [250, 200, 260],
          [10, 260, 320],
          [390, 260, 320],
          [176, 320, 380],
          [226, 320, 380],
          [14, 380, 440],
          [386, 380, 440],
        ].map(([x, y1, y2]) => (
          <line key={`${x}-${y1}`} x1={x} y1={y1} x2={x} y2={y2} />
        ))}
      </g>

      {/* Luz de la tira bajo el rótulo, derramada por el muro */}
      <g className="puerta-luz" style={{ "--luz": luz } as CSSProperties}>
        <g className="puertas-encendido">
          <ellipse cx={200} cy={126} rx={210} ry={46} fill="url(#dp-derrame)" />
        </g>
      </g>

      {/* El rótulo */}
      <rect x={12} y={38} width={376} height={80} rx={3} fill="#0f1628" stroke="#26314a" strokeWidth={1.5} />
      <rect x={18} y={44} width={364} height={68} rx={2} fill="none" stroke="#e3c46a" strokeOpacity={0.35} strokeWidth={0.8} />
      <text
        x={200}
        y={93}
        textAnchor="middle"
        textLength={340}
        lengthAdjust="spacingAndGlyphs"
        fill="url(#dp-oro)"
        style={{ fontFamily: "var(--font-rotulo)", fontSize: 44 }}
      >
        CAFE - BAR DOS PUERTAS
      </text>
      <g className="puerta-luz" style={{ "--luz": luz } as CSSProperties}>
        <g className="puertas-encendido">
          <rect x={12} y={38} width={376} height={80} rx={3} fill="url(#dp-luz-rotulo)" />
          <rect x={34} y={118} width={332} height={4} rx={2} fill="#ffe2a6" />
        </g>
      </g>

      {/* Las dos puertas, con la luz de dentro */}
      <g className="puerta-luz" style={{ "--luz": Math.max(luz, 0.3) } as CSSProperties}>
        <g className="puertas-encendido">
          <g className="puertas-respiran">
            <Door x={34} people="one" />
            <Door x={254} people="two" />
          </g>
        </g>
      </g>

      {/* La pizarra de la fachada */}
      <g>
        <rect x={160} y={186} width={80} height={164} rx={2} fill="#14171d" stroke="#2c3038" strokeWidth={2} />
        <g fill="#f3ecdc" style={{ fontFamily: "var(--font-condensed)" }} textAnchor="middle">
          <text x={200} y={208} fontSize={13} letterSpacing={0.6}>
            PINCHOS 2€
          </text>
          <text x={200} y={268} fontSize={11.5} letterSpacing={0.4}>
            BOCADILLOS 4€
          </text>
          <text x={200} y={312} fontSize={12} letterSpacing={0.6}>
            RACIONES
          </text>
        </g>
        <g stroke="#f3ecdc" strokeOpacity={0.32} strokeWidth={1.6} strokeLinecap="round">
          {[220, 228, 236, 244].map((y, i) => (
            <line key={y} x1={172 + (i % 2) * 4} y1={y} x2={226 - (i % 3) * 5} y2={y} />
          ))}
          {[280, 288].map((y, i) => (
            <line key={y} x1={174} y1={y} x2={224 - i * 8} y2={y} />
          ))}
          {[322, 330, 338].map((y, i) => (
            <line key={y} x1={172 + i * 3} y1={y} x2={228 - i * 4} y2={y} />
          ))}
        </g>
      </g>

      {/* Acera y luz derramada */}
      <rect y={440} width={400} height={20} fill="#15171c" />
      <g className="puerta-luz" style={{ "--luz": luz } as CSSProperties}>
        <g className="puertas-encendido">
          <ellipse cx={90} cy={446} rx={96} ry={16} fill="url(#dp-derrame)" />
          <ellipse cx={310} cy={446} rx={96} ry={16} fill="url(#dp-derrame)" />
          {SPARKS.map((s) => (
            <circle
              key={`${s.x}-${s.y}`}
              className="chispa"
              cx={s.x}
              cy={s.y}
              r={1.6}
              fill="#ffe2a6"
              style={{ "--dx": `${s.dx}px`, "--dur": `${s.dur}s`, "--delay": `${s.delay}s`, opacity: 0 } as CSSProperties}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
