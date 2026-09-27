"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { damp, damp3 } from "maath/easing";
import {
  demotePerformanceTier,
  reportMeasuredFrameRate,
  type PerfProfile,
  type PerformanceTier,
} from "@/hooks/usePerformanceTier";
import type { PointerVec } from "@/hooks/usePointerParallax";
import SceneLights from "./SceneLights";
import TixolaPan from "./TixolaPan";
import FloatingFood from "./FloatingFood";
import EmberParticles from "./EmberParticles";

/**
 * Post-procesado aparte, y solo cuando la gama lo permite.
 *
 * El barril de `@react-three/postprocessing` importa de forma estática las 37 clases de efecto del
 * paquete `postprocessing` (GodRays, SSAO, DepthOfField, SMAA, LUT3D…) para que aquí se usen tres:
 * Bloom, Vignette y ToneMapping. Medido sobre `node_modules`, los dos paquetes pesan ~172 KB gz, y
 * con el import estático viajaban en el mismo chunk que la escena: un móvil de gama media los
 * descargaba, parseaba y compilaba para luego no encender el bloom. Con `dynamic` quedan en un chunk
 * asíncrono que solo pide la gama alta. Sin `ssr: false` Next intentaría prerenderizar un efecto de
 * R3F fuera de un Canvas.
 */
const Effects = dynamic(() => import("./Effects"), { ssr: false });

/** "split": copy a la izquierda, sartén a la derecha (≥ lg). "stacked": sartén arriba, copy abajo. */
export type HeroLayout = "stacked" | "split";

export interface HeroSceneProps {
  profile: PerfProfile;
  pointer: RefObject<PointerVec>;
  layout: HeroLayout;
  /** false cuando el hero no está en pantalla o la pestaña está oculta → frameloop "demand" */
  active: boolean;
  /** Se llama en el primer frame renderizado (para fundir el fallback estático). */
  onReady: () => void;
}

interface LayoutSpec {
  anchor: [number, number, number];
  scale: number;
  camera: [number, number, number];
  look: [number, number, number];
  glowCenter: [number, number];
}

/*
 * "split" (portada editorial): la sartén ocupa el 55 % derecho del viewport y asoma ligeramente
 * por detrás del titular anclado abajo a la izquierda (el Hero pinta un degradado lateral para la
 * legibilidad). "stacked" (móvil): sartén en el 45 % superior, copy debajo.
 */
const LAYOUTS: Record<HeroLayout, LayoutSpec> = {
  split: { anchor: [1.45, -0.05, 0], scale: 1.06, camera: [0, 1.7, 8.4], look: [0.4, 0.2, 0], glowCenter: [0.62, 0.44] },
  stacked: { anchor: [0, 2.3, 0], scale: 0.55, camera: [0, 2.0, 9.4], look: [0, 0.9, 0], glowCenter: [0.5, 0.64] },
};

/* Objetos de trabajo a nivel de módulo (cero asignaciones en useFrame). */
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3(0.4, 0.2, 0);

/* ──────────────────────────────────────────────────────────────
   Fondo: plano lejano con degradado radial rojo (shader) + dithering anti-banding
   ────────────────────────────────────────────────────────────── */

const BACKDROP_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BACKDROP_FRAGMENT = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uGlow;
  uniform vec3 uGlowDeep;
  uniform vec2 uCenter;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 d = (vUv - uCenter) * vec2(1.6, 1.0);
    float r = length(d);
    float pulse = 0.94 + 0.06 * sin(uTime * 0.9);
    vec3 col = mix(uGlow, uGlowDeep, smoothstep(0.0, 0.22 * pulse, r));
    col = mix(col, uBase, smoothstep(0.12, 0.62 * pulse, r));
    col = mix(col, uBase * 0.6, smoothstep(0.55, 1.0, vUv.y));
    col += (hash(vUv * 1024.0) - 0.5) * (1.5 / 255.0);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

type BackdropUniforms = {
  uBase: THREE.IUniform<THREE.Color>;
  uGlow: THREE.IUniform<THREE.Color>;
  uGlowDeep: THREE.IUniform<THREE.Color>;
  uCenter: THREE.IUniform<THREE.Vector2>;
  uTime: THREE.IUniform<number>;
};

function Backdrop({ pointer, layout }: { pointer: RefObject<PointerVec>; layout: HeroLayout }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo<BackdropUniforms>(
    () => ({
      uBase: { value: new THREE.Color("#0c0c0c") },
      uGlow: { value: new THREE.Color("#7d131a") },
      uGlowDeep: { value: new THREE.Color("#3a0e13") },
      uCenter: { value: new THREE.Vector2(0.6, 0.42) },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (mesh) {
      // El fondo se mueve en sentido contrario al puntero: profundidad.
      damp(mesh.position, "x", -pointer.current.x * 1.2, 0.8, dt);
      damp(mesh.position, "y", 0.5 - pointer.current.y * 0.8, 0.8, dt);
    }
    if (mat) {
      const spec = LAYOUTS[layout];
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      damp(mat.uniforms.uCenter.value, "x", spec.glowCenter[0], 0.8, dt);
      damp(mat.uniforms.uCenter.value, "y", spec.glowCenter[1], 0.8, dt);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, -16]} scale={[80, 50, 1]} renderOrder={-10}>
      <planeGeometry />
      <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={BACKDROP_VERTEX} fragmentShader={BACKDROP_FRAGMENT} depthWrite={false} />
    </mesh>
  );
}

/* ──────────────────────────────────────────────────────────────
   Cámara con parallax y grupo de anclaje según layout
   ────────────────────────────────────────────────────────────── */

function CameraRig({ pointer, layout }: { pointer: RefObject<PointerVec>; layout: HeroLayout }) {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const spec = LAYOUTS[layout];
    _camTarget.set(spec.camera[0] + pointer.current.x * 0.45, spec.camera[1] + pointer.current.y * 0.3, spec.camera[2]);
    damp3(state.camera.position, _camTarget, 0.7, dt);
    damp(_lookTarget, "x", spec.look[0], 0.7, dt);
    damp(_lookTarget, "y", spec.look[1], 0.7, dt);
    state.camera.lookAt(_lookTarget);
  });
  return null;
}

function LayoutRig({ layout, children }: { layout: HeroLayout; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const spec = LAYOUTS[layout];
    damp(g.position, "x", spec.anchor[0], 0.7, dt);
    damp(g.position, "y", spec.anchor[1], 0.7, dt);
    damp(g.scale, "x", spec.scale, 0.7, dt);
    damp(g.scale, "y", spec.scale, 0.7, dt);
    damp(g.scale, "z", spec.scale, 0.7, dt);
  });
  const spec = LAYOUTS[layout];
  return (
    <group ref={ref} position={spec.anchor} scale={spec.scale}>
      {children}
    </group>
  );
}

/** Avisa al contenedor en el primer frame pintado (fundido del fallback). */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });
  return null;
}

/* ──────────────────────────────────────────────────────────────
   Sonda de fotogramas: mide la escena real y degrada la página entera
   ────────────────────────────────────────────────────────────── */

/** Descartes de arranque: hasta que se cumplan LAS DOS condiciones no se acumula nada. */
const PROBE_WARMUP_SECONDS = 0.6;
const PROBE_WARMUP_FRAMES = 20;
/** Ventana nominal y ventana ampliada cuando el equipo no da ni 40 fotogramas en el primer segundo. */
const PROBE_WINDOW_MS = 1000;
const PROBE_MAX_WINDOW_MS = 2000;
const PROBE_MIN_SAMPLES = 40;
/** Un fotograma de más de 100 ms no es rendimiento: es un GC, una pestaña de fondo o un tirón del SO. */
const PROBE_OUTLIER_MS = 100;
/** Techos de la gama actual. p50 es lo que se siente; p90 es el tartamudeo que el público sí ve. */
const PROBE_P50_HOLD_MS = 20;
const PROBE_P90_HOLD_MS = 28;
const PROBE_P90_DEMOTE_MS = 33;
/** Pausa antes de volver a medir tras bajar de gama: hay que dejar que la escena nueva se asiente. */
const PROBE_RESETTLE_SECONDS = 1;

/* Reserva fija para las muestras: 2 s a 120 Hz con margen. Se escribe en sitio, sin asignar por
   fotograma, porque una sonda que genera basura falsea justo lo que pretende medir. */
const PROBE_CAPACITY = 320;

const NEXT_LOWER: Record<PerformanceTier, PerformanceTier> = { high: "mid", mid: "low", low: "low" };

/** Renderizadores por software (sin GPU) más habituales. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i;

/**
 * ¿WebGL está emulado por software? Ocurre en contenedores, escritorio remoto, máquinas virtuales,
 * navegadores headless y equipos cuya GPU Chrome ha puesto en la lista negra tras un cuelgue.
 *
 * Ahí la sonda no debe opinar: el tiempo de fotograma de un renderizador por software no dice nada
 * sobre una GPU que no existe, y medirlo apagaría la escena en TODOS esos entornos —incluido el
 * navegador headless con el que `scripts/qa-hero.cjs` comprueba que la portada no sale negra, que es
 * justo la regresión contra la que existe esa prueba—. La gama se queda como la dejó la heurística.
 *
 * La detección está DUPLICADA respecto a Effects.tsx a propósito y no se importa de allí: Effects se
 * carga con `dynamic` precisamente para que el paquete `postprocessing` viva en otro chunk, y un
 * import estático —aunque fuese de una función de tres líneas— lo devolvería al chunk de la portada y
 * anularía el mayor ahorro de bytes de todo el paquete.
 */
function useSoftwareRenderer(): boolean {
  const gl = useThree((state) => state.gl);
  return useMemo(() => {
    try {
      const ctx = gl.getContext();
      const info = ctx.getExtension("WEBGL_debug_renderer_info");
      const name = info
        ? String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? "")
        : String(ctx.getParameter(ctx.RENDERER) ?? "");
      return SOFTWARE_RENDERER.test(name);
    } catch {
      /* Si el navegador no deja consultarlo, asumimos GPU real (caso mayoritario). */
      return false;
    }
  }, [gl]);
}

/** Percentil sobre una copia ya ordenada. `q` en [0, 1]. */
function percentile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
  return sorted[index];
}

/**
 * Sonda de fotogramas montada DENTRO del Canvas.
 *
 * Por qué aquí y no con el `usePerformanceGovernor` del almacén: ese mide con su propio bucle de
 * `requestAnimationFrame`, y lo que hace falta saber es cuánto tarda ESTE bucle de render en cerrar
 * un fotograma. `useFrame` ya entrega ese `delta`, así que no hay un segundo bucle compitiendo con
 * el que se está juzgando ni un `performance.now` paralelo que mida otra cosa. El veredicto se
 * publica en el almacén (`demotePerformanceTier` / `reportMeasuredFrameRate`), NO en un estado local:
 * si el equipo no da la talla tiene que degradarse la página entera —cristal, marquesina, spotlight—
 * y no solo el lienzo.
 *
 * Prioridad -1 a propósito: con prioridad > 0 R3F desactiva su render automático y espera que el
 * suscriptor pinte, y la portada saldría NEGRA (es exactamente la regresión que vigila
 * `scripts/qa-hero.cjs`). Cero o negativo conservan el render automático.
 */
function FrameProbe({ tier }: { tier: PerformanceTier }) {
  const software = useSoftwareRenderer();
  const samples = useRef<Float64Array>(null);
  samples.current ??= new Float64Array(PROBE_CAPACITY);

  const count = useRef(0);
  const frames = useRef(0);
  const windowStart = useRef(0);
  /* Momento (en el reloj de la escena) a partir del cual se puede volver a medir. */
  const resumeAt = useRef(0);
  const settled = useRef(false);
  const finished = useRef(false);
  /* La gama con la que se tomó la muestra en curso: si cambia por fuera, la muestra ya no vale. */
  const measuringTier = useRef(tier);

  useFrame((state, delta) => {
    if (finished.current || software) return;

    const now = state.clock.elapsedTime;
    const ms = delta * 1000;

    /* Una bajada de gama venida de fuera (o la nuestra) invalida lo acumulado: la escena que se
       estaba midiendo ya no es la que se pinta. */
    if (measuringTier.current !== tier) {
      measuringTier.current = tier;
      count.current = 0;
      frames.current = 0;
      settled.current = false;
      windowStart.current = 0;
      resumeAt.current = now + PROBE_RESETTLE_SECONDS;
      return;
    }
    if (now < resumeAt.current) return;

    /* Calentamiento: la compilación de los ~13 programas de shader de la escena y la subida de las
       texturas de hierro caen en los primeros fotogramas y envenenarían cualquier media. Se exigen
       las dos condiciones (tiempo Y fotogramas) porque en un equipo muy lento 0,6 s pueden ser tres
       fotogramas, y en uno muy rápido 20 fotogramas pueden ser 160 ms. */
    frames.current += 1;
    if (!settled.current) {
      if (now - resumeAt.current < PROBE_WARMUP_SECONDS || frames.current < PROBE_WARMUP_FRAMES) return;
      settled.current = true;
      windowStart.current = now;
      count.current = 0;
      return;
    }

    if (ms <= PROBE_OUTLIER_MS && count.current < PROBE_CAPACITY) {
      samples.current![count.current++] = ms;
    }

    const elapsed = (now - windowStart.current) * 1000;
    /* Se cierra al llegar a la ventana con muestras suficientes; si no hay 40 se alarga hasta 2 s y
       se decide con lo que haya (si el equipo no da 40 fotogramas en dos segundos, ya lo ha dicho). */
    if (elapsed < PROBE_WINDOW_MS) return;
    if (count.current < PROBE_MIN_SAMPLES && elapsed < PROBE_MAX_WINDOW_MS) return;
    if (count.current === 0) return;

    const sorted = Array.from(samples.current!.subarray(0, count.current)).sort((a, b) => a - b);
    /* Suelo de 0,1 ms para que la conversión a FPS no pueda dar Infinity si algún navegador entrega
       un delta de 0 (pasa al reanudar tras un cambio de pestaña en algunas versiones de Safari). */
    const p50 = Math.max(percentile(sorted, 0.5), 0.1);
    const p90 = percentile(sorted, 0.9);
    /* MEDIANA y no media: un único fotograma de 300 ms arrastra la media lo bastante para apagar el
       3D de un equipo que va perfectamente. */
    const holds = p50 <= PROBE_P50_HOLD_MS && p90 <= PROBE_P90_HOLD_MS;
    /* Franja gris tolerada a propósito: p50 bueno con p90 entre 28 y 33 ms es un parpadeo aislado
       que no justifica quitarle el bloom a un equipo capaz. */
    const stutters = p90 > PROBE_P90_DEMOTE_MS;
    const slow = p50 > PROBE_P50_HOLD_MS;

    if (!holds && (slow || stutters) && tier !== "low") {
      /* Escalera de uno en uno, nunca al vacío: high → mid vuelve a medir sin sombras, sin bloom y
         con menos partículas, y solo si TAMBIÉN falla ahí se apaga la escena. */
      const next = NEXT_LOWER[tier];
      demotePerformanceTier(next);
      if (next === "low") {
        finished.current = true;
        reportMeasuredFrameRate(1000 / p50);
      }
      return;
    }

    /* Veredicto final: se marca el perfil como medido con los FPS reales. El almacén es un trinquete,
       así que esta llamada solo puede confirmar la gama o bajarla; nunca subirla. */
    finished.current = true;
    reportMeasuredFrameRate(1000 / p50);
  }, -1);

  return null;
}

/* ──────────────────────────────────────────────────────────────
   Escena: presupuestos acotados en el punto de consumo
   ────────────────────────────────────────────────────────────── */

/*
 * Los presupuestos vienen de `usePerformanceTier` (fichero de la fase de fundación, que no se toca
 * desde aquí), pero se acotan de nuevo a la entrada del Canvas: esta escena es el mayor consumidor
 * de fotogramas del sitio y el techo que aguanta una GPU integrada es más bajo que el que puede
 * permitirse un fondo de partículas cualquiera. `Math.min` y no una asignación: si el perfil baja
 * sus cifras, manda el perfil.
 */
const MAX_DPR: Record<PerformanceTier, number> = {
  /* 1,25 en vez de 1,5 en gama media: 1,56× píxeles en lugar de 2,25×, es decir un 30 % menos de
     relleno en TODAS las pasadas (escena, partículas, bloom). Es el ajuste más barato que existe. */
  low: 1,
  mid: 1.25,
  high: 1.75,
};

/*
 * Techo de chispas. Sube de 420/900 a 520/1280 para igualar los presupuestos de `usePerformanceTier`:
 * tener DOS cifras distintas (perfil y techo) escondía que el recorte real era del 46 % respecto a la
 * versión anterior, y la columna de brasas perdía densidad precisamente en la gama que este encargo viene
 * a rescatar. `Math.min` se mantiene como salvaguarda por si el perfil baja sus cifras, no como un
 * segundo recorte.
 */
const MAX_PARTICLES: Record<PerformanceTier, number> = { low: 140, mid: 520, high: 1280 };
/** Flotantes: cuatro objetos más o menos no cambian la lectura de la órbita, pero sí el hilo. */
const MAX_FLOATERS: Record<PerformanceTier, number> = { low: 4, mid: 8, high: 12 };

/**
 * Canvas R3F del hero. Se importa con next/dynamic (ssr:false) desde HeroCanvas.
 * - dpr / antialias / sombras / post-procesado según el perfil de rendimiento, acotados arriba.
 * - frameloop "demand" cuando `active` es false: los useFrame dejan de ejecutarse.
 * - `<FrameProbe/>` como primer hijo: mide la escena de verdad y degrada la página si no llega.
 */
export default function HeroScene({ profile, pointer, layout, active, onReady }: HeroSceneProps) {
  const spec = LAYOUTS[layout];
  const tier = profile.tier;
  const dpr = useMemo<[number, number]>(
    () => [Math.min(profile.dpr[0], MAX_DPR[tier]), Math.min(profile.dpr[1], MAX_DPR[tier])],
    [profile.dpr, tier],
  );

  return (
    <Canvas
      dpr={dpr}
      gl={{
        /* `antialias` en gama media Y alta; solo se apaga donde ya no hay escena.
           El intento anterior lo reservaba a la gama alta con el argumento de que "el borde se sigue
           leyendo porque el dpr ya está por encima de 1": a dpr 1,25 y sin multimuestreo, no. La silueta
           curva de la sartén y el mango sobre el halo de brasas es exactamente el caso en que se ven los
           dientes de sierra, y "gama media" es el objetivo declarado del encargo, así que es el sitio
           donde menos se puede permitir un borde sucio.
           Se compensa NO subiendo el dpr en media (se queda en 1,25): el MSAA arregla los bordes, que es
           lo que se ve, y el dpr bajo mantiene el relleno controlado. Y si aun así el equipo no llega,
           ahora hay quien lo diga: la sonda de fotogramas de abajo baja de gama en los primeros dos
           segundos, que es la red de seguridad que el cliente pidió como requisito. */
        antialias: tier !== "low",
        powerPreference: "high-performance",
        /* `alpha: false` SIEMPRE. El Backdrop es un plano de 80×50 en z = -16 que escribe alfa 1,0 y,
           con fov 35 y la cámara en z 8,4, cubre un área visible de ~36×15,4 unidades: el encuadre
           completo. Nunca se ve nada a través del lienzo, así que el canal alfa solo servía para que
           el compositor del navegador mezclara una capa opaca con lo que hay detrás. */
        alpha: false,
        stencil: false,
      }}
      camera={{ fov: 35, near: 0.1, far: 60, position: spec.camera }}
      shadows={profile.shadows}
      frameloop={active ? "always" : "demand"}
      onCreated={(state) => {
        state.gl.toneMappingExposure = 1.05;
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* Primer hijo: la sonda se suscribe antes que nadie y ve el fotograma completo. */}
      <FrameProbe tier={tier} />
      <ReadySignal onReady={onReady} />
      <fog attach="fog" args={["#0c0c0c", 11, 26]} />
      <Backdrop pointer={pointer} layout={layout} />
      <CameraRig pointer={pointer} layout={layout} />
      <LayoutRig layout={layout}>
        <SceneLights profile={profile} />
        <TixolaPan pointer={pointer} shadows={profile.shadows} tier={tier} />
        <FloatingFood count={Math.min(profile.floaters, MAX_FLOATERS[tier])} pointer={pointer} shadows={profile.shadows} />
        <EmberParticles count={Math.min(profile.particles, MAX_PARTICLES[tier])} />
      </LayoutRig>
      {/* El chunk del post-procesado no se pide siquiera si la gama no lo enciende. */}
      {profile.postprocessing && <Effects enabled />}
    </Canvas>
  );
}
