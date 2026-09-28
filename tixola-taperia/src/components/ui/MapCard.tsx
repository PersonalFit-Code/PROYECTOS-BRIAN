"use client";

import { ArrowUp, ExternalLink, Footprints, Globe, Image as ImageIcon, Map, MapPin, MessageCircle, Navigation } from "lucide-react";
import Image from "next/image";
import { useCallback, useId, useMemo, useState, type ReactNode } from "react";
import { useChat } from "@/components/chat/ChatProvider";
import { useConsent } from "@/components/legal/CookieConsent";
import NeonButton from "@/components/ui/NeonButton";
import { BUSINESS } from "@/data/business";
import { localizePhotoById } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * MapCard — tarjeta de ubicación.
 *
 * El visor YA NO monta una maqueta WebGL. El cliente pidió que la web vaya fina en cualquier
 * dispositivo y que salga Three.js, así que la manzana se dibuja como PLANO SVG estático y
 * `CityMap3D.tsx` desaparece. Lo que se pedía del mapa sigue en pie —que se vea dónde está el local,
 * que sea fiel a la ubicación real y que resulte atractivo—, solo cambia la técnica:
 *
 *  · Cero lienzos, cero shaders, cero `IntersectionObserver` ni escuchas de scroll: el plano viaja ya
 *    pintado en el HTML, así que no hay contexto que crear, ni fotograma que esperar, ni vía de
 *    degradación que cubrir (el visor no puede quedarse en negro porque no hay nada que arrancar).
 *  · Las medidas del plano se heredan de la maqueta 3D, que se levantó sobre el callejero real: la
 *    Catedral de San Martiño al NE, Santa Eufemia al SO y la Rúa Juan de Austria subiendo al NNE.
 *  · Leyenda con puntos de color (Tixola · Catedral · Santa Eufemia), rosa de los vientos y escala.
 *  · TRES VISTAS con un conmutador: el MAPA REAL de Google, el plano y la FOTO REAL DE LA FACHADA.
 *    El mapa manda y sale abierto: el cliente lo pidió con estas palabras, "por esta referencia la
 *    gente no va a saber guiarse muy bien". El plano cuenta el "a un minuto de la Catedral", pero
 *    quien viene de fuera necesita el callejero de verdad, y necesitaba encontrarlo sin pulsar nada.
 *    La foto es contenido
 *    comercial del negocio —en una landing de hostelería enseña el sitio al que se va a entrar—, no
 *    un adorno técnico, así que no se fue con el Canvas: antes vivía como plan B de la maqueta 3D y
 *    ahora es una vista de pleno derecho. El conmutador va FUERA del visor, en la cabecera del panel,
 *    porque dentro ya compiten la leyenda, la rosa de los vientos, las chinchetas y la escala, y en un
 *    móvil de 390 px no caben sin pisarse.
 *  · Panel con dirección (BUSINESS.address), plus code, "A un minuto de la Catedral" y los CTAs
 *    "Cómo llegar" / "Abrir en Google Maps": la acción útil de verdad, que abre la ruta en Google.
 *  · CONSENTIMIENTO: el <iframe> de Google solo se monta si hay consentimiento vigente (cargarlo
 *    manda la IP del visitante a Google). Sin decisión o con rechazo, el visor abre en el plano y la
 *    pestaña del mapa ofrece un botón para cargarlo a propósito, solo para esa visita.
 *  · Enlace al camarero virtual con la pregunta "¿Cómo llego…?" precargada.
 */

const EMBED_URL = `https://www.google.com/maps?q=${BUSINESS.geo.lat},${BUSINESS.geo.lng}&z=17&output=embed`;

/** Id de la foto de la fachada en `src/data/photos.ts` (su `alt` está traducido a los cuatro idiomas). */
const FACHADA_ID = "fachada";

/* ════════════════════════════════════════════════════════════
   EL PLANO
   Todo en METROS, con la puerta de Tixola en el origen: x al este, y al sur (norte arriba).
   Es el mismo sistema de coordenadas que usaba la maqueta 3D, de modo que las medidas tomadas del
   callejero (nave de 85×25 m de la Catedral, calle peatonal de ~5 m, manzanas de 8-24 m de fachada)
   se reutilizan tal cual en vez de volver a medir nada.
   ════════════════════════════════════════════════════════════ */

/** Ventana dibujada: 256 × 192 m, o sea el mismo 4:3 del visor (el SVG encaja sin bandas). */
const VIEW = { x: -102, y: -108, w: 256, h: 192 } as const;
const VIEW_BOX = `${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`;

/** La Rúa Juan de Austria no sube al norte franco: va girada 20° hacia el este. */
const STREET_DEG = 20;
const SIN = Math.sin((STREET_DEG * Math.PI) / 180);
const COS = Math.cos((STREET_DEG * Math.PI) / 180);

/** (u, v) en coordenadas de calle → (x, y) en metros. u sube hacia el NNE; v cruza hacia el ESE. */
function uv(u: number, v: number): readonly [number, number] {
  return [u * SIN + v * COS, -u * COS + v * SIN];
}

/**
 * Dentro de `<g transform="rotate(20)">` basta dibujar en (X, Y) = (v, −u) para caer en el sitio:
 * la rotación de SVG lleva (X, Y) a (X·cos − Y·sin, X·sin + Y·cos), que es exactamente `uv()`. Así la
 * retícula de la calle se describe con rectángulos rectos —legibles y fáciles de corregir— y el giro
 * lo aplica el navegador una sola vez a todo el grupo.
 */
const STREET_TRANSFORM = `rotate(${STREET_DEG})`;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Tramo a lo largo de la calle: de u = `from` a u = `to`, centrado en v, de `width` m de ancho. */
function alongStreet(from: number, to: number, v: number, width: number): Rect {
  return { x: v - width / 2, y: -to, width, height: to - from };
}

/** Travesía que cruza la calle: de v = `from` a v = `to`, centrada en u, de `width` m de ancho. */
function acrossStreet(from: number, to: number, u: number, width: number): Rect {
  return { x: from, y: -u - width / 2, width: to - from, height: width };
}

/** Empedrado en coordenadas de calle. La peatonal de Tixola y la retícula que la acompaña. */
const STREET_PAVING: readonly Rect[] = [
  alongStreet(-78, 44, 6, 6), // Rúa Juan de Austria (peatonal, estrecha)
  alongStreet(-15, 45, -23.5, 5), // calle trasera, al oeste de Tixola
  alongStreet(-72, 58, 22.5, 5),
  alongStreet(-72, 58, 39, 5.5),
  alongStreet(-73, 53, 55.5, 5),
  alongStreet(-73, 48, 71.5, 4.5),
  alongStreet(-64, 44, 87.5, 5),
  alongStreet(-56, 40, 103, 4.5),
  // Calles de la ladera que sube hacia el oeste (Lamas Carvajal y su retícula de callejas)
  alongStreet(-30, 78, -40.5, 4.5),
  alongStreet(-88, 78, -57, 5),
  alongStreet(-88, 78, -73, 4.5),
  acrossStreet(3, 85, -28, 6), // travesía sur, hacia la Praza da Magdalena
  acrossStreet(-78, 71, 30, 6), // travesía norte
];

/** Empedrado alineado E–O: los dos flancos de la Catedral. */
const CITY_PAVING: readonly Rect[] = [
  { x: 7, y: -52.5, width: 110, height: 6 }, // flanco sur
  { x: 6, y: -88, width: 140, height: 6 }, // flanco norte
];

/** Praza do Trigo (entre el final de la calle y la Catedral) y el ensanche de la Praza da Magdalena. */
const TRIGO = alongStreet(41, 61, 5, 32);
const MAGDALENA_NECK = alongStreet(-33, -15, 2, 12);
const MAGDALENA = { cx: -20, cy: 20, r: 12.5 } as const;

/* ── Manzanas ───────────────────────────────────────────────── */

interface RowSpec {
  /** "street": la hilera sigue la calle. "world": alineada E–O (las de detrás de la Catedral). */
  frame?: "street" | "world";
  /** eje de la hilera: v en coordenadas de calle, o y en metros si `frame` es "world" */
  v: number;
  /** fondo de las casas */
  depth: number;
  from: number;
  to: number;
  /** huecos que la hilera respeta: travesías, plazas, el solar de Tixola */
  gaps?: ReadonlyArray<readonly [number, number]>;
  /** anchura de fachada mínima y máxima */
  run: readonly [number, number];
  seed: number;
}

interface Plot extends Rect {
  tone: string;
}

/** Hash determinista en [0,1): la misma trama de casas en cada render, servidor y cliente incluidos. */
function hash(a: number, b: number) {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Granitos de la parte vieja: hierro con derivas a burdeos, como las fachadas reales. */
const TONES = ["#26242a", "#2b2a2e", "#302d33", "#332427", "#2e2b31", "#3a2b2e"] as const;

function plot(spec: RowSpec, start: number, run: number, tone: string): Plot {
  return spec.frame === "world"
    ? { x: start, y: spec.v - spec.depth / 2, width: run, height: spec.depth, tone }
    : { x: spec.v - spec.depth / 2, y: -(start + run), width: spec.depth, height: run, tone };
}

/** Rellena una hilera de fachadas con casas de anchura variable, saltándose los huecos. */
function fillRow(spec: RowSpec): Plot[] {
  const plots: Plot[] = [];
  let at = spec.from;
  let i = 0;
  while (at < spec.to - 4) {
    const run = Math.min(spec.run[0] + hash(spec.seed, i) * (spec.run[1] - spec.run[0]), spec.to - at);
    const end = at + run;
    const tone = TONES[Math.floor(hash(spec.seed + 7, i) * TONES.length)];
    const gap = spec.gaps?.find(([a, b]) => at < b && end > a);
    if (gap) {
      /* Restos de menos de 6 m no son una casa, son una junta: mejor dejar el hueco limpio. */
      if (gap[0] - at >= 6) plots.push(plot(spec, at, gap[0] - at, tone));
      at = gap[1];
    } else {
      plots.push(plot(spec, at, run, tone));
      at = end;
    }
    i++;
  }
  return plots;
}

const CROSS_SOUTH: readonly [number, number] = [-31, -25];
const CROSS_NORTH: readonly [number, number] = [27, 33];
/** El solar de Tixola: lo dibuja su propio rectángulo, resaltado, así que la hilera lo salta. */
const TIXOLA_GAP: readonly [number, number] = [-6, 6];

const ROWS: readonly RowSpec[] = [
  // Acera oeste (la de Tixola), de la Praza da Magdalena a la Praza do Trigo
  { v: -2.5, depth: 12, from: -13, to: 42, gaps: [TIXOLA_GAP, CROSS_NORTH], run: [8, 13], seed: 1 },
  // Segunda y tercera hilera hacia el oeste
  { v: -15.5, depth: 12, from: -13, to: 42, gaps: [CROSS_NORTH], run: [9, 14], seed: 2 },
  { v: -32, depth: 12, from: -13, to: 42, gaps: [CROSS_NORTH], run: [12, 20], seed: 3 },
  // Sur, detrás de Santa Eufemia
  { v: -2.5, depth: 12, from: -104, to: -82, run: [10, 12], seed: 4 },
  { v: -15.5, depth: 12, from: -104, to: -82, run: [10, 12], seed: 5 },
  // Acera este de la Rúa Juan de Austria y las hileras que siguen hacia el este
  { v: 14.25, depth: 11.5, from: -70, to: 40, gaps: [CROSS_SOUTH, CROSS_NORTH], run: [8, 13], seed: 6 },
  { v: 30.75, depth: 11.5, from: -70, to: 56, gaps: [CROSS_SOUTH, CROSS_NORTH], run: [11, 17], seed: 7 },
  { v: 47.25, depth: 11.5, from: -70, to: 56, gaps: [CROSS_SOUTH, CROSS_NORTH], run: [14, 22], seed: 8 },
  { v: 63, depth: 12, from: -70, to: 50, gaps: [CROSS_SOUTH, CROSS_NORTH], run: [16, 24], seed: 9 },
  { v: 79, depth: 12, from: -70, to: 44, gaps: [CROSS_SOUTH, CROSS_NORTH], run: [16, 26], seed: 12 },
  { v: 95, depth: 12, from: -60, to: 44, gaps: [CROSS_SOUTH], run: [16, 26], seed: 16 },
  { v: 111, depth: 12, from: -52, to: 40, gaps: [CROSS_SOUTH], run: [18, 28], seed: 17 },
  // Manzanas de la ladera oeste: cierran el casco por detrás de Tixola sin llegar a la Catedral.
  // La hilera de v = −49 arranca más al norte para no montarse sobre Santa Eufemia.
  { v: -49, depth: 12, from: -30, to: 78, gaps: [CROSS_NORTH], run: [12, 20], seed: 13 },
  { v: -65, depth: 12, from: -88, to: 78, gaps: [CROSS_NORTH], run: [14, 22], seed: 14 },
  { v: -81, depth: 12, from: -88, to: 78, gaps: [CROSS_NORTH], run: [16, 24], seed: 15 },
  // Norte de la Catedral y este del ábside (alineadas E–O)
  { frame: "world", v: -97, depth: 14, from: 12, to: 112, run: [16, 24], seed: 10 },
  { frame: "world", v: -66, depth: 16, from: 118, to: 150, run: [14, 18], seed: 11 },
];

/* Las manzanas se calculan UNA vez al cargar el módulo, no en cada render: son constantes. */
const STREET_PLOTS = ROWS.filter((r) => r.frame !== "world").flatMap(fillRow);
const CITY_PLOTS = ROWS.filter((r) => r.frame === "world").flatMap(fillRow);

/* ── Hitos ──────────────────────────────────────────────────── */

/** Tixola: acera oeste, 11 m de fachada y 12 m de fondo; la puerta da a la calle. */
const TIXOLA_PLOT = { x: -8.5, y: -5.5, width: 12, height: 11 } as const;
/** La puerta, punto de la chincheta: v = borde de fachada (−2,5 + 12/2). */
const DOOR = uv(0, 3.5);
/** Las tres mesas de la terraza, a pie de calle frente a la puerta. */
const TERRACE = [-3.2, 0, 3.2].map((u) => ({ cx: 5.9, cy: -u }));

/**
 * Catedral de San Martiño: nave románica E–O de 85×25 m, crucero N–S, cimborrio octogonal sobre el
 * crucero, ábside con capillas al este y la torre de las campanas en la esquina suroeste (la que se
 * ve al levantar la vista desde la terraza).
 */
const CATHEDRAL = {
  nave: { x: 19.5, y: -78.5, width: 85, height: 25 },
  transept: { x: 71, y: -89.5, width: 14, height: 47 },
  dome: { cx: 78, cy: -66, r: 7.2 },
  /** ábside: semicírculo que sale por el este de la nave */
  apse: "M 104.5 -78.5 A 12.5 12.5 0 0 1 104.5 -53.5 Z",
  chapels: [
    { cx: 112, cy: -75, r: 4 },
    { cx: 112, cy: -57, r: 4 },
  ],
  tower: { x: 8.5, y: -65, width: 11, height: 11 },
  /** Ancla de la etiqueta: sobre el flanco norte, para no tapar la silueta del templo. */
  label: [62, -84] as const,
} as const;

/**
 * Santa Eufemia: barroca, nave de 22×40 m, cúpula sobre el crucero y dos torres con remates
 * bulbosos en la fachada cóncava, que mira al NE (hacia la Praza da Magdalena y la terraza).
 * Se dibuja en su propio sistema local y se gira 135°, igual que hacía la maqueta.
 */
const CHURCH = {
  center: [-44, 44] as const,
  transform: "translate(-44 44) rotate(-135)",
  nave: { x: -11, y: -22, width: 22, height: 40 },
  dome: { cx: 0, cy: -8, r: 6 },
  towers: [
    { x: -11.5, y: 16.5, width: 7, height: 7 },
    { x: 4.5, y: 16.5, width: 7, height: 7 },
  ],
} as const;

/**
 * Ruta a pie hasta la Catedral: se sube la peatonal, se cruza la Praza do Trigo y se sale al flanco
 * sur del templo. Es el minuto que anuncia la tarjeta, dibujado; no pretende ser un GPS (para eso
 * está el botón "Cómo llegar", que abre la ruta de verdad en Google Maps).
 */
const WALK = [uv(0, 5.5), uv(18, 6), uv(38, 6), uv(48, 3), [26, -47.5] as const, [36, -49.5] as const]
  .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
  .join(" ");

/** (x, y) en metros → posición porcentual dentro del visor, para las etiquetas y chinchetas HTML. */
function atMeters(x: number, y: number) {
  return {
    left: `${((x - VIEW.x) / VIEW.w) * 100}%`,
    top: `${((y - VIEW.y) / VIEW.h) * 100}%`,
  };
}

/** "Rúa Juan de Austria" sin el ", 7": el plano rotula la calle, no el portal. */
const STREET_NAME = BUSINESS.address.street.split(",")[0];

/**
 * Ancla de la etiqueta de Tixola: al SE de la puerta, lo bastante lejos para no pisar la chincheta
 * ni siquiera en un móvil, donde el plano se dibuja a la mitad de escala.
 */
const TIXOLA_LABEL = uv(-15, 22);
/** Ancla de la insignia "1 min": sobre la ruta, a mitad de la subida por la peatonal. */
const WALK_BADGE = uv(24, 7);

/* ════════════════════════════════════════════════════════════
   Plano dibujado
   ════════════════════════════════════════════════════════════ */

const PLOT_STROKE = { stroke: "#f9f6f0", strokeOpacity: 0.15, strokeWidth: 0.4 } as const;

function HistoricPlan({ ariaLabel }: { ariaLabel: string }) {
  /* `useId` lleva dos puntos, que en un `url(#…)` no molestan pero ensucian el marcado: fuera. */
  const uid = useId().replace(/:/g, "");
  const granite = `${uid}-granite`;
  const engrave = `${uid}-engrave`;
  const warmth = `${uid}-warmth`;
  const gold = `${uid}-gold`;

  return (
    <svg viewBox={VIEW_BOX} role="img" aria-label={ariaLabel} className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id={granite} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#17151a" />
          <stop offset="1" stopColor="#0b0a0c" />
        </linearGradient>
        {/* Retícula grabada de 16 m: da el aire de plano de piedra sin coste (un solo patrón). */}
        <pattern id={engrave} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 0 0 H 16 M 0 0 V 16" fill="none" stroke="#f9f6f0" strokeOpacity="0.045" strokeWidth="0.22" />
        </pattern>
        {/* Resplandores con degradado radial en vez de desenfoques: un `filter` sobre media lámina
            obliga al navegador a rasterizar y difuminar toda esa zona; un degradado es un relleno. */}
        <radialGradient id={warmth}>
          <stop offset="0" stopColor="#d8323c" stopOpacity="0.3" />
          <stop offset="0.55" stopColor="#b21e27" stopOpacity="0.1" />
          <stop offset="1" stopColor="#b21e27" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={gold}>
          <stop offset="0" stopColor="#e8c27a" stopOpacity="0.2" />
          <stop offset="1" stopColor="#e8c27a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Suelo */}
      <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} fill={`url(#${granite})`} />
      <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} fill={`url(#${engrave})`} />
      {/* El halo dorado va sobre la piedra de la Catedral (no sobre su etiqueta, que está al norte). */}
      <circle cx={CATHEDRAL.dome.cx - 8} cy={CATHEDRAL.dome.cy} r={62} fill={`url(#${gold})`} />
      <circle cx={DOOR[0]} cy={DOOR[1]} r={48} fill={`url(#${warmth})`} />

      {/* Empedrado: las calles van MÁS CLARAS que las manzanas, como en un plano de papel, para que
          el recorrido se lea de un vistazo incluso en la miniatura de un móvil. */}
      <g fill="#46403a">
        {CITY_PAVING.map((r, i) => (
          <rect key={`c${i}`} {...r} />
        ))}
        <g transform={STREET_TRANSFORM}>
          {STREET_PAVING.map((r, i) => (
            <rect key={`s${i}`} {...r} />
          ))}
        </g>
      </g>
      {/* Plazas: un peldaño más claras que la calle (son las que abren el casco) */}
      <g fill="#524a41">
        <circle cx={MAGDALENA.cx} cy={MAGDALENA.cy} r={MAGDALENA.r} />
        <g transform={STREET_TRANSFORM}>
          <rect {...TRIGO} />
          <rect {...MAGDALENA_NECK} />
        </g>
      </g>

      {/* Manzanas de granito */}
      <g {...PLOT_STROKE}>
        {CITY_PLOTS.map((p, i) => (
          <rect key={`cp${i}`} x={p.x} y={p.y} width={p.width} height={p.height} fill={p.tone} rx={0.6} />
        ))}
        <g transform={STREET_TRANSFORM}>
          {STREET_PLOTS.map((p, i) => (
            <rect key={`sp${i}`} x={p.x} y={p.y} width={p.width} height={p.height} fill={p.tone} rx={0.6} />
          ))}
        </g>
      </g>

      {/* Catedral de San Martiño: piedra cálida con perfil dorado */}
      <g fill="#6b5b49" stroke="#e8c27a" strokeOpacity="0.55" strokeWidth="0.5">
        <rect {...CATHEDRAL.nave} />
        <rect {...CATHEDRAL.transept} />
        <path d={CATHEDRAL.apse} />
        {CATHEDRAL.chapels.map((c, i) => (
          <circle key={`ch${i}`} cx={c.cx} cy={c.cy} r={c.r} />
        ))}
        <rect {...CATHEDRAL.tower} />
        <circle cx={CATHEDRAL.dome.cx} cy={CATHEDRAL.dome.cy} r={CATHEDRAL.dome.r} fill="#7d6b55" />
      </g>
      {/* La torre y el cimborrio, marcados: son las dos siluetas que se buscan con la vista */}
      <g fill="none" stroke="#e8c27a" strokeOpacity="0.85" strokeWidth="0.7">
        <rect {...CATHEDRAL.tower} />
        <circle cx={CATHEDRAL.dome.cx} cy={CATHEDRAL.dome.cy} r={CATHEDRAL.dome.r - 2.4} />
      </g>

      {/* Santa Eufemia */}
      <g transform={CHURCH.transform} fill="#5f5648" stroke="#efe9dd" strokeOpacity="0.4" strokeWidth="0.5">
        <rect {...CHURCH.nave} />
        {CHURCH.towers.map((t, i) => (
          <rect key={`t${i}`} {...t} />
        ))}
        <circle cx={CHURCH.dome.cx} cy={CHURCH.dome.cy} r={CHURCH.dome.r} fill="#6d6353" />
      </g>

      {/* Tixola: el único volumen en pimentón de todo el plano */}
      <g transform={STREET_TRANSFORM}>
        <rect {...TIXOLA_PLOT} fill="#5a1b21" stroke="#ffb3b8" strokeOpacity="0.8" strokeWidth="0.7" rx={0.8} />
        {/* Terraza: tres sombrillas a pie de calle frente a la puerta */}
        <g fill="#b21e27" fillOpacity="0.9">
          {TERRACE.map((t, i) => (
            <circle key={`p${i}`} cx={t.cx} cy={t.cy} r={1.5} />
          ))}
        </g>
      </g>

      {/* Ruta a pie: de la puerta a la Catedral */}
      <path d={WALK} fill="none" stroke="#e8c27a" strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="5 4.5" />

      {/* Anillos de la chincheta. `animate-neon-pulse` solo mueve la opacidad, y la regla global de
          `prefers-reduced-motion` lo deja quieto para quien pide menos movimiento. */}
      <g className="animate-neon-pulse" fill="none" stroke="#d8323c">
        <circle cx={DOOR[0]} cy={DOOR[1]} r={9} strokeOpacity="0.55" strokeWidth="0.9" />
        <circle cx={DOOR[0]} cy={DOOR[1]} r={16} strokeOpacity="0.28" strokeWidth="0.7" />
      </g>

      {/* Nombre de la calle, rotulado a lo largo de su trazado. Sale de BUSINESS.address (sin el
          número) y no de una cadena traducida: es un topónimo, igual en los cuatro idiomas.
          `textLength` fija el ancho en metros para que la rotulación quepa siempre en su tramo. */}
      <g transform={STREET_TRANSFORM}>
        <text
          transform="translate(7.6 62) rotate(-90)"
          textLength={46}
          lengthAdjust="spacingAndGlyphs"
          fontSize={4.4}
          fill="#f9f6f0"
          fillOpacity="0.55"
          className="font-caps uppercase"
        >
          {STREET_NAME}
        </text>
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Foto real de la fachada
   ──────────────────────────────────────────────────────────── */
/**
 * La fachada de Tixola en Rúa Juan de Austria: toldos rojos y pizarra del día. Es la misma imagen que
 * servía de plan B cuando el visor era un lienzo WebGL, con su `alt` traducido (`photos.ts` está en
 * español y `localizePhotoById` aplica la traducción del idioma activo).
 *
 * Fondo opaco en el pie y nada de `backdrop-filter`: este rótulo se apoya sobre una foto que ocupa el
 * visor entero, así que desenfocarla obligaría al compositor a rehacer ese recorte en cada repintado
 * de la tarjeta para un resultado que a esta opacidad es indistinguible de un color plano.
 */
function FacadePhoto({ caption }: { caption: string }) {
  const locale = useLocale();
  const photo = useMemo(() => localizePhotoById(locale, FACHADA_ID), [locale]);
  return (
    <>
      <Image
        src={photo?.src ?? "/images/fachada.jpg"}
        alt={photo?.alt ?? BUSINESS.name}
        fill
        sizes="(min-width: 1024px) 52vw, 100vw"
        className="object-cover"
        style={{ objectPosition: photo?.focus ?? "50% 40%" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,12,0.1)_0%,rgba(12,12,12,0.28)_45%,rgba(12,12,12,0.88)_100%)]"
      />
      <div className="absolute inset-x-3 bottom-3 z-[6] flex items-center gap-3 rounded-2xl border border-cream/10 bg-iron-900/90 px-3 py-2.5 shadow-glass md:inset-x-4 md:bottom-4 md:px-4 md:py-3">
        <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pimenton text-cream shadow-neon">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold text-cream">{BUSINESS.address.street}</p>
          <p className="truncate text-xs text-cream-muted">{caption}</p>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Conmutador plano / foto
   ──────────────────────────────────────────────────────────── */
type MapView = "map" | "plan" | "photo";

/**
 * Dos botones con `aria-pressed` y no una `tablist`: un grupo de pestañas ARIA obliga a gestionar las
 * flechas del teclado y a sacar los botones del orden de tabulación, y aquí no hay panel que recorrer
 * —solo dos estados de la misma imagen—. Con `aria-pressed` el lector anuncia cuál está activo, cada
 * botón se alcanza con el tabulador y no hay teclado que reimplementar. Los 44 px de alto son el
 * mínimo táctil del proyecto.
 */
function ViewSwitch({
  view,
  onChange,
  label,
  mapLabel,
  planLabel,
  photoLabel,
}: {
  view: MapView;
  onChange: (next: MapView) => void;
  label: string;
  mapLabel: string;
  planLabel: string;
  photoLabel: string;
}) {
  const option = (value: MapView, text: string, icon: ReactNode) => {
    const active = view === value;
    return (
      <button
        type="button"
        onClick={() => onChange(value)}
        aria-pressed={active}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-caps text-[9px] uppercase tracking-[0.18em] transition-colors duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light",
          active ? "bg-pimenton/20 text-cream" : "text-cream-muted hover:text-cream",
        )}
      >
        {icon}
        {text}
      </button>
    );
  };
  return (
    <div role="group" aria-label={label} className="flex shrink-0 items-center rounded-full border border-cream/10 bg-iron-900/70 p-0.5">
      {option("map", mapLabel, <Globe className="h-3.5 w-3.5" aria-hidden />)}
      {option("plan", planLabel, <Map className="h-3.5 w-3.5" aria-hidden />)}
      {option("photo", photoLabel, <ImageIcon className="h-3.5 w-3.5" aria-hidden />)}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Leyenda del plano
   ──────────────────────────────────────────────────────────── */
function Legend({ items, label }: { items: ReadonlyArray<{ text: string; dot: string }>; label: string }) {
  return (
    <ul
      aria-label={label}
      /* Fondo opaco, sin `backdrop-filter`: desenfocar lo que hay debajo de esta píldora obligaría al
         compositor a recomponer el plano entero cada vez que la tarjeta se mueve por el scroll.

         ARRIBA en móvil y abajo a partir de `sm`. Por debajo de `sm` los tres rótulos no caben en una
         línea (en gallego y portugués son aún más largos), la píldora envuelve a dos y, anclada abajo a
         la izquierda, cortaba a media palabra la rotulación «RÚA JUAN DE AUSTRIA» que el plano dibuja a
         lo largo de la calle: se leía «…DE AU» y el resto asomaba tenue por detrás del fondo, que parece
         un recorte defectuoso y no una decisión. Arriba a la izquierda solo tiene debajo manzanas de
         granito, y el ancho se limita para no llegar a la rosa de los vientos. */
      className="absolute left-3 top-3 z-[6] flex max-w-[calc(100%-4.75rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-cream/10 bg-iron-900/90 px-3 py-1.5 font-caps text-[9px] uppercase tracking-[0.18em] text-cream-200 shadow-glass sm:bottom-3 sm:top-auto sm:max-w-[calc(100%-1.5rem)]"
    >
      {items.map((item) => (
        <li key={item.text} className="inline-flex items-center gap-1.5">
          <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", item.dot)} />
          {item.text}
        </li>
      ))}
    </ul>
  );
}

/* Etiqueta sobre el plano: píldora anclada a un punto en metros. */
const LABEL_CLASS = "whitespace-nowrap rounded-full border px-2.5 py-1 font-caps text-[9px] uppercase tracking-[0.2em]";

/* ────────────────────────────────────────────────────────────
   Tarjeta
   ──────────────────────────────────────────────────────────── */
export interface MapCardProps {
  className?: string;
}

export default function MapCard({ className }: MapCardProps) {
  const m = useMessages();
  const t = useFormat();
  const { open: openChat } = useChat();

  /**
   * ¿Se puede cargar el mapa de Google? Montar su <iframe> conecta el navegador del visitante con
   * Google, que recibe su IP y puede instalar sus cookies, así que NO se monta por las bravas.
   * Se reutiliza la casilla que el aviso ya ofrece (`analytics`) en vez de inventar una categoría
   * nueva: es la que la política de cookies describe, con estas palabras, como "analítica y cookies
   * de terceros que se instalan al cargar el mapa". Añadir otra obligaría a subir CONSENT_VERSION y
   * tirar las decisiones ya tomadas por todos los visitantes.
   * `loadedByHand` es la vía de escape de quien ha dicho que no y aun así quiere ver el mapa: vale
   * solo para esta visita y no se guarda en ningún sitio.
   */
  const consent = useConsent();
  const consented = consent?.analytics === true;
  const [loadedByHand, setLoadedByHand] = useState(false);
  const mapReady = consented || loadedByHand;

  /**
   * Vista del visor. NO se guarda en estado: se DEDUCE. Mientras el visitante no toque el conmutador
   * manda el mapa si se puede cargar, y el plano si no. Así el servidor pinta el plano (allí todavía
   * no se sabe qué ha decidido quien mira: el consentimiento vive en `localStorage`) y el navegador
   * pasa al mapa en cuanto lo confirma, sin un efecto que persiga al estado —que es lo que provoca
   * renders en cascada— y sin que aceptar las cookies con la sección ya en pantalla se quede a medias.
   * En cuanto alguien elige vista, su elección manda y nadie se la cambia por debajo.
   * La foto NO se monta hasta que alguien la pide por primera vez (y a partir de ahí se queda
   * montada, para que volver a ella sea instantáneo): así la sección de ubicación no descarga una
   * imagen que la mayoría de visitantes no va a abrir, y el plano —que es SVG y viaja en el HTML—
   * sigue costando cero.
   */
  const [pickedView, setPickedView] = useState<MapView | null>(null);
  const view: MapView = pickedView ?? (mapReady ? "map" : "plan");
  const [photoMounted, setPhotoMounted] = useState(false);
  const showView = useCallback((next: MapView) => {
    if (next === "photo") setPhotoMounted(true);
    setPickedView(next);
  }, []);

  const x = m.experience.map;
  const c = m.common;

  const legend = useMemo(
    () => [
      { text: x.legendYou, dot: "bg-pimenton-light shadow-[0_0_8px_rgba(216,50,60,0.9)]" },
      { text: x.legendCathedral, dot: "bg-gold shadow-[0_0_8px_rgba(232,194,122,0.8)]" },
      { text: x.legendChurch, dot: "bg-cream-400" },
    ],
    [x],
  );

  /**
   * Alternativa textual del plano. Se compone con cadenas ya traducidas a los cuatro idiomas. La clave
   * `map.mapAria` que había para esto describía "un mapa 3D estilizado" —una maqueta que ya no existe—
   * y se ha BORRADO en los cuatro idiomas en vez de dejarla huérfana: era el nombre obvio para el
   * `aria-label` de este `<svg role="img">`, y quien la reutilizara le anunciaría un mapa 3D a quien usa
   * lector de pantalla. Lo que se dice aquí es lo que se dibuja: dónde está el local, a qué distancia
   * queda la Catedral, cómo es la zona y qué hitos se ven.
   */
  const planAria = useMemo(
    () => [x.kicker, BUSINESS.address.full, x.subtitle, x.area, `${x.legendCathedral} · ${x.legendChurch}`].join(". "),
    [x],
  );

  const askWaiter = useCallback(() => openChat({ prefill: x.askWaiterPrefill, page: "home" }), [openChat, x.askWaiterPrefill]);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Degradado prehorneado en lugar de `glass-smoke`: el mismo hierro ahumado sin pedirle al
          navegador que vuelva a desenfocar el fondo en cada repintado de la tarjeta. */}
      <div className="relative overflow-hidden rounded-[28px] border border-cream/10 bg-[linear-gradient(160deg,rgba(20,20,20,0.92),rgba(20,20,20,0.82))] p-2 shadow-card">
        {/* Visor: aspecto fijo 4:3, el mismo del viewBox del plano */}
        <div
          /* `data-map-viewport` es el asidero de scripts/qa-hero.cjs, que comprueba que este visor no
             se queda en negro. No tiene efecto visual. */
          data-map-viewport
          className="relative aspect-[4/3] select-none overflow-hidden rounded-[20px] bg-iron-900"
        >
          {/* Plano. Se queda montado siempre (es SVG, no cuesta nada) y solo se oculta: así conmutar de
              vista no vuelve a construir el dibujo. `inert` saca de la accesibilidad y del tabulador lo
              que no se está viendo, que es lo que espera quien navega con lector de pantalla. */}
          <div
            inert={view !== "plan"}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-[var(--ease-out-expo)]",
              view === "plan" ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <HistoricPlan ariaLabel={planAria} />
          </div>

          {/* Mapa real de Google. Se monta en cuanto hay permiso y se queda montado: volver a él desde
              el plano o la foto es instantáneo, sin recargar el mapa ni perder el encuadre.
              `pointer-events-none` mientras no es la vista activa: un <iframe> invisible pero encima
              se quedaría con los clics y con la rueda del ratón sobre el plano. `loading="lazy"` deja
              que el navegador espere a que la sección se acerque a la pantalla: la portada no paga
              nada por este mapa. */}
          {mapReady && (
            <div
              inert={view !== "map"}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-[var(--ease-out-expo)]",
                view === "map" ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <iframe
                src={EMBED_URL}
                title={t(x.embedTitle, { brand: BUSINESS.name })}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                /* `max-md:pointer-events-none`: en un teléfono el mapa ocupa la mitad de la pantalla y
                   el dedo que baja por la página cae encima. Si el <iframe> escucha, el gesto lo
                   atrapa Google y mueve el mapa mientras la página se queda clavada —el visitante
                   cree que la web se ha colgado—. Se ve igual de bien, y para moverlo de verdad están
                   "Cómo llegar" y "Abrir en Google Maps" justo debajo, que abren la app de Maps con la
                   ruta hecha: en un móvil eso es lo que se quiere, no arrastrar un mapa incrustado.
                   Con ratón sí escucha: allí el gesto de scroll ya lo protege el propio Google
                   pidiendo Ctrl, y arrastrar con el ratón no compite con nada. */
                className="block h-full w-full border-0 bg-iron-900 max-md:pointer-events-none"
              />
            </div>
          )}

          {/* Foto real de la fachada, la otra vista. */}
          {photoMounted && (
            <div
              inert={view !== "photo"}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-[var(--ease-out-expo)]",
                view === "photo" ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <FacadePhoto caption={x.subtitle} />
            </div>
          )}

          {/* Viñeta por encima del plano y de la foto. Sobre el mapa de Google no: allí oscurecería
              los nombres de las calles del borde, que es justo lo que se ha venido a leer. */}
          {view !== "map" && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(12,12,12,0.6)_100%)]"
            />
          )}

          {/* Pestaña del mapa sin permiso para cargarlo: se dice qué pasa al cargarlo y se ofrece
              hacerlo solo para esta visita. Nada se conecta con Google hasta que se pulsa. */}
          {view === "map" && !mapReady && (
            <div className="absolute inset-0 z-[6] grid place-items-center bg-iron-900 px-6 text-center">
              <div className="max-w-[26rem]">
                <Globe className="mx-auto h-7 w-7 text-cream-muted" aria-hidden />
                <p className="mt-3 font-sans text-sm leading-relaxed text-cream-200">{x.mapNotice}</p>
                <NeonButton
                  variant="outline"
                  size="sm"
                  onClick={() => setLoadedByHand(true)}
                  icon={<Map aria-hidden />}
                  className="mt-4"
                >
                  {x.realMap}
                </NeonButton>
              </div>
            </div>
          )}

          {/* Capas del plano (chinchetas, leyenda, rosa de los vientos, escala): solo con el plano a la
              vista. Sobre la foto no significan nada y taparían la fachada. */}
          {view === "plan" && (
            <>
              {/* Chinchetas y etiquetas en HTML, no en SVG: así conservan su tamaño en píxeles y siguen
              legibles en un móvil, donde el plano se dibuja a menos de la mitad de escala. */}
              <div aria-hidden className="pointer-events-none absolute inset-0 z-[6]">
                <span
                  style={atMeters(DOOR[0], DOOR[1])}
                  className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cream/20 bg-pimenton text-cream shadow-neon"
                >
                  <MapPin className="h-4 w-4" />
                </span>
                <span
                  style={atMeters(TIXOLA_LABEL[0], TIXOLA_LABEL[1])}
                  className={cn(
                    LABEL_CLASS,
                    "absolute -translate-x-1/2 -translate-y-1/2 border-pimenton-light/60 bg-iron-900/90 text-cream shadow-neon",
                  )}
                >
                  {x.legendYou}
                </span>
                <span
                  style={atMeters(CATHEDRAL.label[0], CATHEDRAL.label[1])}
                  className={cn(
                    LABEL_CLASS,
                    "absolute hidden -translate-x-1/2 -translate-y-1/2 border-gold/40 bg-iron-900/85 text-gold sm:block",
                  )}
                >
                  {x.legendCathedral}
                </span>
                <span
                  style={atMeters(CHURCH.center[0], CHURCH.center[1])}
                  className={cn(
                    LABEL_CLASS,
                    "absolute hidden -translate-x-1/2 -translate-y-1/2 border-cream/30 bg-iron-900/85 text-cream-200 sm:block",
                  )}
                >
                  {x.legendChurch}
                </span>
                {/* El minuto a pie, sobre la ruta. Va `aria-hidden` con el resto de la capa: la distancia
                ya la dice el panel de abajo con su texto traducido ("A un minuto de la Catedral"). */}
                <span
                  style={atMeters(WALK_BADGE[0], WALK_BADGE[1])}
                  className="absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-gold/30 bg-iron-900/90 px-2 py-0.5 font-sans text-[10px] font-medium text-gold"
                >
                  <Footprints className="h-3 w-3" />1 min
                </span>
              </div>

              {/* Rosa de los vientos: el plano está orientado al norte, conviene decirlo. */}
              <span
                aria-hidden
                className="absolute right-3 top-3 z-[6] inline-flex items-center gap-1 rounded-full border border-cream/10 bg-iron-900/85 px-2.5 py-1 font-caps text-[9px] uppercase tracking-[0.22em] text-cream/80"
              >
                <ArrowUp className="h-3 w-3 text-pimenton-light" />N
              </span>

              <Legend items={legend} label={x.legend} />

              {/* Escala: 50 m medidos sobre el propio viewBox, así que sigue siendo cierta a cualquier
              anchura. Se oculta en móvil, donde la leyenda ya ocupa la banda inferior. */}
              <span
                aria-hidden
                /* El ancho va en el contenedor porque el porcentaje se mide contra el visor: 50 m de los
               256 del viewBox son siempre el 19,5 % de la caja, a cualquier anchura de pantalla. */
                style={{ width: `${((50 / VIEW.w) * 100).toFixed(2)}%` }}
                className="absolute bottom-4 right-3 z-[6] hidden flex-col items-end gap-1 sm:flex"
              >
                <span className="block h-1.5 w-full border-x border-b border-cream/50" />
                <span className="font-mono text-[9px] tabular-nums text-cream/70">50 m</span>
              </span>
            </>
          )}
        </div>

        {/* Panel de información */}
        <div className="px-3 pb-3 pt-4 md:px-4 md:pb-4 md:pt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="font-caps text-[10px] uppercase tracking-[0.3em] text-cream-muted">{x.kicker}</p>
            <ViewSwitch
              view={view}
              onChange={showView}
              label={x.viewLabel}
              mapLabel={x.mapLive}
              planLabel={x.plan}
              photoLabel={x.photo}
            />
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pimenton/20 text-pimenton-light">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <address className="min-w-0 not-italic">
              <p className="font-display text-2xl leading-tight text-cream md:text-3xl">{BUSINESS.address.street}</p>
              <p className="mt-1 font-sans text-sm text-cream-muted">
                {BUSINESS.address.postalCode} {BUSINESS.address.city} · {x.plusCode}{" "}
                <span className="font-mono text-cream-200 tabular-nums">{BUSINESS.address.plusCode}</span>
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-gold">
                <Footprints className="h-4 w-4" aria-hidden />
                {x.distance}
              </p>
              <p className="mt-1 font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">{x.area}</p>
            </address>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <NeonButton
              href={BUSINESS.social.directions}
              target="_blank"
              variant="primary"
              icon={<Navigation aria-hidden />}
              aria-label={c.cta.directionsAria}
              className="w-full sm:flex-1"
            >
              {c.cta.directions}
            </NeonButton>
            <NeonButton
              href={BUSINESS.social.googleMaps}
              target="_blank"
              variant="outline"
              iconRight={<ExternalLink aria-hidden />}
              className="w-full sm:flex-1"
            >
              {c.cta.openMaps}
            </NeonButton>
          </div>
        </div>
      </div>

      {/* Camarero virtual: "¿Cómo llego?" precargado */}
      <button
        type="button"
        onClick={askWaiter}
        className="mt-3 inline-flex min-h-11 items-center gap-2 self-start rounded-full px-2 font-sans text-sm text-cream-muted transition-colors hover:text-cream"
      >
        <MessageCircle className="h-4 w-4 text-pimenton-light" aria-hidden />
        <span className="underline decoration-cream/30 underline-offset-4">{x.askWaiter}</span>
      </button>
    </div>
  );
}
