"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sonda de fotogramas: mide los FPS REALES del dispositivo durante una ventana corta.
 *
 * Existe porque adivinar la potencia por `hardwareConcurrency` / `deviceMemory` falla justo donde
 * más duele: un portátil con gráfica integrada publica 8 núcleos y 8 GB y luego no sostiene el
 * post-procesado, y un iPhone reciente publica 4 núcleos y ninguna memoria y va sobrado. La única
 * señal honesta es el fotograma que el dispositivo consigue pintar con la escena ya montada.
 */

/** Fases de la sonda. `warmup` descarta arranque, `measuring` acumula, `done` ya dio resultado. */
export type FrameRateProbeStatus = "idle" | "warmup" | "measuring" | "done";

export interface FrameRateProbeConfig {
  /** Fotogramas iniciales que se tiran antes de empezar a contar. */
  warmupFrames?: number;
  /** Duración objetivo de la ventana de medida, en ms. */
  sampleMs?: number;
  /** Mínimo de fotogramas para dar la muestra por válida (evita dividir por una muestra ridícula). */
  minFrames?: number;
  /** Tope duro: pasado este tiempo se cierra la medida aunque falten fotogramas. */
  maxMs?: number;
}

export interface FrameRateProbeHandle {
  /** Para la sonda y suelta el listener de visibilidad. */
  stop: () => void;
  /** Vuelve a medir desde el calentamiento, aunque ya hubiera dado resultado. */
  restart: () => void;
}

/* Doce fotogramas ≈ 200 ms a 60 Hz: suficiente para dejar atrás la compilación de shaders, la
   subida de texturas y el primer layout, que son los que hunden la media si se cuentan. */
const DEFAULT_WARMUP_FRAMES = 12;
const DEFAULT_SAMPLE_MS = 1000;
/* Con menos de seis fotogramas la división es ruido; el dispositivo ya está en gama baja igual. */
const DEFAULT_MIN_FRAMES = 6;
/* Si a los 2,5 s no hay muestra decente es que el dispositivo va fatal: se cierra y se decide. */
const DEFAULT_MAX_MS = 2500;

/**
 * Núcleo imperativo de la sonda, sin React. Cuenta con `requestAnimationFrame` usando solo
 * variables numéricas del cierre: NO asigna ningún objeto por fotograma, porque una sonda que
 * genera basura falsearía justo lo que pretende medir.
 */
export function createFrameRateProbe(
  onResult: (fps: number) => void,
  config: FrameRateProbeConfig = {},
  onStatus?: (status: FrameRateProbeStatus) => void,
): FrameRateProbeHandle {
  /* SSR: devolvemos un mando inerte para que quien la use no tenga que comprobar el entorno. */
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { stop: () => {}, restart: () => {} };
  }

  const warmupFrames = config.warmupFrames ?? DEFAULT_WARMUP_FRAMES;
  const sampleMs = config.sampleMs ?? DEFAULT_SAMPLE_MS;
  const minFrames = config.minFrames ?? DEFAULT_MIN_FRAMES;
  const maxMs = Math.max(config.maxMs ?? DEFAULT_MAX_MS, sampleMs);

  let raf = 0;
  let warmed = 0;
  let frames = 0;
  let startedAt = 0;
  let done = false;

  function tick(now: number) {
    if (warmed < warmupFrames) {
      /* El aviso de "warmup" sale del primer fotograma y no de `arm()` a propósito: `arm()` se
         ejecuta dentro del efecto que crea la sonda, y avisar allí provocaría un render en
         cascada nada más montar, justo en el momento que queremos medir limpio. */
      if (warmed === 0) onStatus?.("warmup");
      warmed += 1;
      raf = requestAnimationFrame(tick);
      return;
    }

    /* Primer fotograma ya caliente: marca el origen de la ventana, todavía no cuenta. */
    if (startedAt === 0) {
      startedAt = now;
      frames = 0;
      onStatus?.("measuring");
      raf = requestAnimationFrame(tick);
      return;
    }

    frames += 1;
    const elapsed = now - startedAt;
    if (elapsed < maxMs && (elapsed < sampleMs || frames < minFrames)) {
      raf = requestAnimationFrame(tick);
      return;
    }

    done = true;
    raf = 0;
    onStatus?.("done");
    onResult((frames * 1000) / Math.max(elapsed, 1));
  }

  function arm() {
    if (done || raf !== 0) return;
    warmed = 0;
    frames = 0;
    startedAt = 0;
    raf = requestAnimationFrame(tick);
  }

  function disarm() {
    if (raf === 0) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  /* Con la pestaña oculta el navegador deja de servir rAF (o lo baja a 1 Hz): una muestra tomada
     a caballo de un cambio de pestaña daría 2 FPS y apagaría el 3D de un equipo perfectamente
     capaz. Se tira lo acumulado y se rearma al volver. */
  function onVisibility() {
    if (document.hidden) {
      disarm();
      warmed = 0;
      startedAt = 0;
      frames = 0;
      if (!done) onStatus?.("idle");
      return;
    }
    arm();
  }

  document.addEventListener("visibilitychange", onVisibility);
  if (document.hidden) onStatus?.("idle");
  else arm();

  return {
    stop() {
      disarm();
      document.removeEventListener("visibilitychange", onVisibility);
    },
    restart() {
      done = false;
      disarm();
      if (!document.hidden) arm();
    },
  };
}

export interface FrameRateProbeOptions extends FrameRateProbeConfig {
  /** Con `false` la sonda ni se monta (p. ej. cuando ya se decidió la gama sin medir). */
  enabled?: boolean;
  /** Se llama una vez con los FPS medidos. */
  onResult?: (fps: number) => void;
}

export interface FrameRateProbeResult {
  /** FPS medidos, o `null` mientras no haya resultado. */
  fps: number | null;
  status: FrameRateProbeStatus;
  /** Rearma la sonda (p. ej. tras cambiar de escena o al volver de un modal pesado). */
  restart: () => void;
}

/**
 * Envoltorio React de la sonda. Se monta donde esté el trabajo que se quiere medir: los FPS de una
 * página sin escena 3D no dicen nada útil sobre si la escena 3D cabe.
 */
export function useFrameRateProbe(options: FrameRateProbeOptions = {}): FrameRateProbeResult {
  const { enabled = true, onResult, warmupFrames, sampleMs, minFrames, maxMs } = options;

  const [fps, setFps] = useState<number | null>(null);
  const [phase, setPhase] = useState<FrameRateProbeStatus>("idle");
  /* Contador de rearmes: cambiarlo vuelve a crear la sonda sin duplicar la lógica de arranque. */
  const [generation, setGeneration] = useState(0);

  /* El callback vive en una ref para que quien lo pase en línea (identidad nueva cada render) no
     rearme la sonda sin querer y la medición nunca llegue a cerrarse. */
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  });

  useEffect(() => {
    if (!enabled) return;
    const probe = createFrameRateProbe(
      (value) => {
        setFps(value);
        onResultRef.current?.(value);
      },
      { warmupFrames, sampleMs, minFrames, maxMs },
      setPhase,
    );
    return () => probe.stop();
  }, [enabled, warmupFrames, sampleMs, minFrames, maxMs, generation]);

  const restart = useCallback(() => {
    setFps(null);
    setGeneration((value) => value + 1);
  }, []);

  /* Con la sonda apagada el estado se deriva en lugar de guardarse: así no hace falta un
     `setState` dentro del efecto solo para volver a "idle". */
  return { fps, status: enabled ? phase : "idle", restart };
}
