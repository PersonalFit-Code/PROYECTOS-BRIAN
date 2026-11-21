"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Busto } from "@/components/Personaje";
import { useOficinaQuieta } from "@/components/PausaMovimiento";
import { PUESTO, type FichaPuesto, type Puesto } from "@/lib/oficina";

/**
 * La oficina vista en diagonal desde arriba (isométrica). Todo se dibuja en un SVG: cada punto de
 * la sala (x, y, altura) se convierte en un punto de pantalla con `iso()`. Las fichas que viajan
 * entre mesas son el trabajo que espera a pasar al puesto siguiente.
 */

const U = 46; // ancho de medio azulejo en pantalla
const OX = 372;
const OY = 128;
const ANCHO = 11; // la sala mide 11 × 8 azulejos
const FONDO = 8;
const ALTO_PARED = 2.6;

function iso(x: number, y: number, z = 0): [number, number] {
  return [OX + (x - y) * U, OY + (x + y) * (U / 2) - z * U];
}
const pts = (...p: [number, number][]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

/** Una caja apoyada en el suelo: tapa y las dos caras que se ven. */
function Caja({ x, y, w, d, h, z = 0, tapa, izq, der }: { x: number; y: number; w: number; d: number; h: number; z?: number; tapa: string; izq: string; der: string }) {
  return (
    <g>
      <polygon points={pts(iso(x, y + d, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x, y + d, z))} fill={izq} />
      <polygon points={pts(iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x + w, y, z))} fill={der} />
      <polygon points={pts(iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h))} fill={tapa} />
    </g>
  );
}

export type Lugar = Puesto | "tu";

/** Dónde está cada mesa. El recorrido del trabajo hace una U: fila del fondo y vuelta por delante. */
const SITIO: Record<Lugar, { x: number; y: number }> = {
  captacion: { x: 1.2, y: 1.6 },
  diagnostico: { x: 4.6, y: 1.6 },
  guion: { x: 8, y: 1.6 },
  tu: { x: 8, y: 5.2 },
  oferta: { x: 4.6, y: 5.2 },
  diseno: { x: 1.2, y: 5.2 },
};
export const RECORRIDO: Lugar[] = ["captacion", "diagnostico", "guion", "tu", "oferta", "diseno"];

const TU: FichaPuesto = { nombre: "Tú", cargo: "Llamadas", hace: "", camiseta: "#15131f", pelo: "#4a3524", piel: "#eec3a0", peinado: "corto" };
const fichaDe = (l: Lugar) => (l === "tu" ? TU : PUESTO[l]);

export interface DatosPuesto {
  activo: boolean;
  frase: string;
}
export interface Tramo {
  de: Lugar;
  a: Lugar;
  /** Cuántos negocios esperan para pasar al puesto siguiente. */
  esperan: number;
}

const MESA_W = 1.9;
const MESA_D = 0.9;
const MESA_H = 0.75;

/** Centro de la tapa de la mesa, en pantalla: de ahí salen y ahí llegan las fichas. */
function centroMesa(l: Lugar): [number, number] {
  const s = SITIO[l];
  return iso(s.x + MESA_W / 2, s.y + MESA_D / 2, MESA_H);
}

function Mesa({ lugar, datos, elegido, quieta }: { lugar: Lugar; datos: DatosPuesto; elegido: boolean; quieta: boolean }) {
  const s = SITIO[lugar];
  const f = fichaDe(lugar);
  const [px, py] = iso(s.x + MESA_W / 2, s.y - 0.3, 0.3); // los pies de la silla, detrás de la mesa
  const [lx, ly] = iso(s.x + MESA_W / 2, s.y + MESA_D / 2, MESA_H);
  const [ex, ey] = iso(s.x + MESA_W / 2, s.y + MESA_D + 0.55, 0);
  const escala = 0.62;
  return (
    <g className="puesto-svg" data-activo={datos.activo && !quieta ? "si" : "no"}>
      {elegido && <polygon points={pts(iso(s.x - 0.3, s.y - 0.9), iso(s.x + MESA_W + 0.3, s.y - 0.9), iso(s.x + MESA_W + 0.3, s.y + MESA_D + 0.3), iso(s.x - 0.3, s.y + MESA_D + 0.3))} fill="#6447fa" opacity="0.14" />}
      {/* Sombra */}
      <polygon points={pts(iso(s.x - 0.1, s.y + 0.15), iso(s.x + MESA_W + 0.1, s.y + 0.15), iso(s.x + MESA_W + 0.1, s.y + MESA_D + 0.2), iso(s.x - 0.1, s.y + MESA_D + 0.2))} fill="#15131f" opacity="0.07" />
      {/* Personaje, de pie detrás de la mesa y mirando al frente */}
      <g transform={`translate(${px - 100 * escala} ${py - 124 * escala}) scale(${escala})`}>
        <Busto f={f} />
      </g>
      <Caja x={s.x} y={s.y} w={MESA_W} d={MESA_D} h={MESA_H} tapa="#e9dcc3" izq="#c9b594" der="#b39f7e" />
      {/* Portátil */}
      <g transform={`translate(${lx} ${ly})`}>
        <polygon points="-17,-3 0,-11 17,-3 0,5" fill="#3a3658" />
        <polygon points="-17,-3 0,5 0,-17 -17,-25" fill="#2a2740" />
        <circle className="p-luz" cx="-8.5" cy="-11" r="2.6" fill="#8f7bff" />
      </g>
      <g transform={`translate(${lx} ${ly})`}>
        <circle className="p-mano p-mano-i" cx="-24" cy="-12" r="4" fill={f.piel} />
        <circle className="p-mano p-mano-d" cx="6" cy="-17" r="4" fill={f.piel} />
      </g>
      {/* Rótulo en el suelo */}
      <g transform={`translate(${ex} ${ey})`}>
        <rect x="-46" y="-12" width="92" height="34" rx="9" fill="#ffffff" stroke={elegido ? "#6447fa" : "#e8e5f3"} strokeWidth={elegido ? 2 : 1} />
        <text x="0" y="2" textAnchor="middle" fontFamily="Montserrat, system-ui, sans-serif" fontWeight="700" fontSize="12" fill="#15131f">
          {f.nombre}
        </text>
        <text x="0" y="15" textAnchor="middle" fontFamily="Quicksand, system-ui, sans-serif" fontWeight="600" fontSize="10" fill="#5b5870">
          {f.cargo}
        </text>
      </g>
    </g>
  );
}

/** Una ficha (un negocio) que va de una mesa a la siguiente. */
function Ficha({ de, a, retraso, quieta }: { de: [number, number]; a: [number, number]; retraso: number; quieta: boolean }) {
  const alto = Math.min(de[1], a[1]) - 34;
  const medio: [number, number] = [(de[0] + a[0]) / 2, alto];
  if (quieta) return <rect x={medio[0] - 7} y={medio[1] - 5} width="14" height="10" rx="2.5" fill="#6447fa" />;
  return (
    <motion.rect
      width="14"
      height="10"
      rx="2.5"
      fill="#6447fa"
      initial={{ x: de[0] - 7, y: de[1] - 14, opacity: 0 }}
      animate={{ x: [de[0] - 7, medio[0] - 7, a[0] - 7], y: [de[1] - 14, medio[1] - 5, a[1] - 14], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.6, delay: retraso, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut", opacity: { duration: 2.6, delay: retraso, repeat: Infinity, repeatDelay: 1.2, times: [0, 0.15, 0.85, 1] } }}
    />
  );
}

export function OficinaIso({ puestos, tramos, elegido }: { puestos: Record<Lugar, DatosPuesto>; tramos: Tramo[]; elegido: Puesto | null }) {
  const menosMovimiento = useReducedMotion();
  const parada = useOficinaQuieta();
  const quieta = Boolean(menosMovimiento) || parada;

  // De atrás hacia delante, para que las mesas de delante tapen a las del fondo.
  const orden = [...RECORRIDO].sort((p, q) => SITIO[p].x + SITIO[p].y - (SITIO[q].x + SITIO[q].y));

  return (
    <div className="oficina-iso relative overflow-hidden rounded-3xl border border-line">
      <svg viewBox="0 0 880 585" className="block w-full" role="img" aria-label="Oficina de neuro·node: seis mesas unidas por el recorrido del trabajo">
        {/* Paredes */}
        <polygon points={pts(iso(0, 0, ALTO_PARED), iso(ANCHO, 0, ALTO_PARED), iso(ANCHO, 0), iso(0, 0))} fill="#f1eeff" />
        <polygon points={pts(iso(0, 0, ALTO_PARED), iso(0, FONDO, ALTO_PARED), iso(0, FONDO), iso(0, 0))} fill="#e6e1fa" />
        {/* Ventanas */}
        {[1.4, 4.4, 7.4].map((x) => (
          <polygon key={x} points={pts(iso(x, 0, 2.1), iso(x + 2, 0, 2.1), iso(x + 2, 0, 0.9), iso(x, 0, 0.9))} fill="#cfe6ff" stroke="#ffffff" strokeWidth="4" />
        ))}
        {/* Cartel */}
        <g transform={`translate(${iso(0, 4, 1.35)[0]} ${iso(0, 4, 1.35)[1]}) skewY(-26.57)`}>
          <text x="0" y="0" textAnchor="middle" fontFamily="Montserrat, system-ui, sans-serif" fontWeight="800" fontSize="26" fill="#15131f">
            neuro<tspan fill="#6447fa">·</tspan>node
          </text>
        </g>
        {/* Suelo */}
        <polygon points={pts(iso(0, 0), iso(ANCHO, 0), iso(ANCHO, FONDO), iso(0, FONDO))} fill="#f7f2e8" />
        {Array.from({ length: ANCHO + 1 }, (_, i) => (
          <line key={`x${i}`} x1={iso(i, 0)[0]} y1={iso(i, 0)[1]} x2={iso(i, FONDO)[0]} y2={iso(i, FONDO)[1]} stroke="#ece4d4" strokeWidth="1" />
        ))}
        {Array.from({ length: FONDO + 1 }, (_, i) => (
          <line key={`y${i}`} x1={iso(0, i)[0]} y1={iso(0, i)[1]} x2={iso(ANCHO, i)[0]} y2={iso(ANCHO, i)[1]} stroke="#ece4d4" strokeWidth="1" />
        ))}
        {/* Alfombra del centro */}
        <polygon points={pts(iso(3.4, 3.2), iso(7.6, 3.2), iso(7.6, 4.5), iso(3.4, 4.5))} fill="#6447fa" opacity="0.08" />
        {/* Planta */}
        <Caja x={10} y={0.4} w={0.6} d={0.6} h={0.5} tapa="#c9b594" izq="#b39f7e" der="#9c8c73" />
        <circle cx={iso(10.3, 0.7, 1.1)[0]} cy={iso(10.3, 0.7, 1.1)[1]} r="20" fill="#3fa37c" />
        <circle cx={iso(10.3, 0.7, 1.5)[0] - 8} cy={iso(10.3, 0.7, 1.5)[1]} r="13" fill="#178a62" />

        {/* El recorrido, pintado en el suelo */}
        {tramos.map((t) => {
          const [a, b] = [iso(SITIO[t.de].x + MESA_W / 2, SITIO[t.de].y + MESA_D / 2), iso(SITIO[t.a].x + MESA_W / 2, SITIO[t.a].y + MESA_D / 2)];
          return <line key={`${t.de}-${t.a}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#6447fa" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" opacity={t.esperan > 0 ? 0.55 : 0.18} />;
        })}

        {orden.map((l) => (
          <Mesa key={l} lugar={l} datos={puestos[l]} elegido={elegido === l} quieta={quieta} />
        ))}

        {/* Las fichas que viajan y cuántas esperan en cada tramo */}
        {tramos.map((t) => {
          const [de, a] = [centroMesa(t.de), centroMesa(t.a)];
          // El contador va en el suelo, a mitad del camino entre las dos mesas.
          const [mx, my] = iso((SITIO[t.de].x + SITIO[t.a].x + MESA_W) / 2, (SITIO[t.de].y + SITIO[t.a].y + MESA_D) / 2);
          return (
            <g key={`f-${t.de}-${t.a}`}>
              {t.esperan > 0 && [0, 1.3].slice(0, t.esperan > 20 ? 2 : 1).map((r) => <Ficha key={r} de={de} a={a} retraso={r} quieta={quieta} />)}
              <g transform={`translate(${mx} ${my})`}>
                <rect x="-21" y="-11" width="42" height="20" rx="10" fill={t.esperan > 0 ? "#6447fa" : "#efedf5"} />
                <text x="0" y="3.5" textAnchor="middle" fontFamily="Quicksand, system-ui, sans-serif" fontWeight="700" fontSize="11.5" fill={t.esperan > 0 ? "#ffffff" : "#45425a"}>
                  {t.esperan}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Zonas que se pueden tocar, encima del dibujo: enlaces de verdad, con su nombre. */}
      {RECORRIDO.filter((l): l is Puesto => l !== "tu").map((l) => {
        const s = SITIO[l];
        const [cx, cy] = iso(s.x + MESA_W / 2, s.y + MESA_D / 2, 0.6);
        return (
          <Link
            key={l}
            href={elegido === l ? "/oficina" : `/oficina?puesto=${l}#detalle`}
            scroll={false}
            aria-current={elegido === l ? "true" : undefined}
            aria-label={`${PUESTO[l].nombre}, ${PUESTO[l].cargo}: ${puestos[l].frase}`}
            title={puestos[l].frase}
            className="absolute block -translate-x-1/2 -translate-y-1/2 rounded-2xl"
            style={{ left: `${(cx / 880) * 100}%`, top: `${(cy / 585) * 100}%`, width: "21%", height: "30%" }}
          />
        );
      })}
    </div>
  );
}
