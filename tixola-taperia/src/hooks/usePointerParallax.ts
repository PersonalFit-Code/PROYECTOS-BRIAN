"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { clamp } from "@/lib/utils";

/** Vector 2D normalizado: x,y ∈ [-1, 1] (x → derecha, y → arriba). */
export interface PointerVec {
  x: number;
  y: number;
}

export type ParallaxSource = "none" | "pointer" | "gyro";

export interface UsePointerParallaxOptions {
  /** Desactiva la captura (p. ej. prefers-reduced-motion). El valor queda fijo en (0, 0). */
  enabled?: boolean;
  /** Tiempo aproximado (s) que tarda el valor suavizado en alcanzar el objetivo. Menor = más reactivo. */
  smoothTime?: number;
  /** Grados de inclinación del móvil que equivalen a ±1. */
  gyroRange?: number;
}

export interface PointerParallax {
  /** Valor suavizado ∈ [-1, 1]. Léelo en `useFrame`/rAF: no provoca renders. */
  pointer: RefObject<PointerVec>;
  /** Objetivo crudo ∈ [-1, 1] (sin suavizar). */
  target: RefObject<PointerVec>;
  /** iOS 13+: el giroscopio requiere permiso concedido tras un gesto del usuario. */
  needsGyroPermission: boolean;
  /** Origen actual de la señal. */
  source: ParallaxSource;
  /** Pide permiso para el giroscopio. Debe llamarse desde un evento de usuario (click/tap). */
  requestGyroPermission: () => Promise<boolean>;
}

type OrientationPermission = "granted" | "denied";
type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<OrientationPermission>;
};

/** Devuelve `DeviceOrientationEvent.requestPermission` si existe (Safari iOS 13+). */
function getRequestPermission(): (() => Promise<OrientationPermission>) | null {
  if (typeof window === "undefined" || typeof window.DeviceOrientationEvent === "undefined") return null;
  const ctor = window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;
  return typeof ctor.requestPermission === "function" ? ctor.requestPermission.bind(ctor) : null;
}

/** Pantalla táctil sin hover (móvil / tablet): candidata a usar el giroscopio. */
function isCoarsePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

/* Snapshot estable (se calcula una sola vez) para useSyncExternalStore: evita setState en efectos. */
let gyroPermissionSnapshot: boolean | null = null;
function getGyroPermissionSnapshot(): boolean {
  if (gyroPermissionSnapshot === null) gyroPermissionSnapshot = isCoarsePointer() && getRequestPermission() !== null;
  return gyroPermissionSnapshot;
}
const subscribeNoop = () => () => {};
const getServerSnapshot = () => false;

/**
 * Parallax unificado ratón / giroscopio.
 *  - Escritorio: posición del ratón en la ventana → (-1..1, -1..1).
 *  - Móvil: `deviceorientation` (gamma/beta) relativo a la pose neutra con la que el usuario sujeta el móvil.
 *  - iOS 13+: expone `needsGyroPermission` para mostrar un chip "Activar 3D" y `requestGyroPermission()`.
 * El valor se suaviza con un amortiguador exponencial independiente del framerate en un rAF que se
 * detiene solo cuando se alcanza el objetivo (coste cero en reposo).
 */
export function usePointerParallax(options: UsePointerParallaxOptions = {}): PointerParallax {
  const { enabled = true, smoothTime = 0.28, gyroRange = 22 } = options;

  const target = useRef<PointerVec>({ x: 0, y: 0 });
  const pointer = useRef<PointerVec>({ x: 0, y: 0 });
  const rafId = useRef(0);
  const lastTs = useRef(0);
  const sourceRef = useRef<ParallaxSource>("none");

  const [source, setSource] = useState<ParallaxSource>("none");
  const [gyroGranted, setGyroGranted] = useState(false);
  const permissionRequired = useSyncExternalStore(subscribeNoop, getGyroPermissionSnapshot, getServerSnapshot);
  const needsGyroPermission = enabled && permissionRequired && !gyroGranted;

  /* Bucle de suavizado: arranca con cada entrada y se apaga al converger. */
  const ensureLoop = useCallback(() => {
    if (rafId.current) return;
    lastTs.current = performance.now();
    const tick = (ts: number) => {
      const dt = clamp((ts - lastTs.current) / 1000, 0, 0.1);
      lastTs.current = ts;
      const k = 1 - Math.exp(-dt / smoothTime);
      const p = pointer.current;
      const t = target.current;
      p.x += (t.x - p.x) * k;
      p.y += (t.y - p.y) * k;
      if (Math.abs(t.x - p.x) < 0.0005 && Math.abs(t.y - p.y) < 0.0005) {
        p.x = t.x;
        p.y = t.y;
        rafId.current = 0;
        return;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
  }, [smoothTime]);

  const setTarget = useCallback(
    (x: number, y: number) => {
      target.current.x = clamp(x, -1, 1);
      target.current.y = clamp(y, -1, 1);
      ensureLoop();
    },
    [ensureLoop],
  );

  /* Limpieza del rAF al desmontar. */
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = 0;
    };
  }, []);

  /* Ratón (y punteros no táctiles). En táctil el dedo hace scroll, no parallax. */
  useEffect(() => {
    if (!enabled) {
      target.current.x = 0;
      target.current.y = 0;
      pointer.current.x = 0;
      pointer.current.y = 0;
      return;
    }
    const onMove = (e: PointerEvent) => {
      if (sourceRef.current === "gyro" || e.pointerType === "touch") return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      setTarget(x, y);
      if (sourceRef.current !== "pointer") {
        sourceRef.current = "pointer";
        setSource("pointer");
      }
    };
    const onLeave = () => {
      if (sourceRef.current === "pointer") setTarget(0, 0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, setTarget]);

  /* Giroscopio (solo pantallas táctiles; en iOS tras conceder permiso). */
  useEffect(() => {
    if (!enabled || !isCoarsePointer()) return;
    if (permissionRequired && !gyroGranted) return;

    let base: { beta: number; gamma: number } | null = null;

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      if (!base) base = { beta: e.beta, gamma: e.gamma };
      // La pose neutra sigue muy lentamente la forma de sujetar el móvil (evita derivas).
      base.beta += (e.beta - base.beta) * 0.002;
      base.gamma += (e.gamma - base.gamma) * 0.002;

      let gx = e.gamma - base.gamma; // inclinación izquierda/derecha
      let gy = e.beta - base.beta; // inclinación adelante/atrás
      const angle = typeof screen !== "undefined" && screen.orientation ? screen.orientation.angle : 0;
      if (angle === 90) {
        const tmp = gx;
        gx = gy;
        gy = -tmp;
      } else if (angle === 270 || angle === -90) {
        const tmp = gx;
        gx = -gy;
        gy = tmp;
      } else if (angle === 180) {
        gx = -gx;
        gy = -gy;
      }
      setTarget(gx / gyroRange, -gy / gyroRange);
      if (sourceRef.current !== "gyro") {
        sourceRef.current = "gyro";
        setSource("gyro");
      }
    };

    window.addEventListener("deviceorientation", onOrientation, true);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation, true);
      if (sourceRef.current === "gyro") {
        sourceRef.current = "none";
        setTarget(0, 0);
      }
    };
  }, [enabled, permissionRequired, gyroGranted, gyroRange, setTarget]);

  const requestGyroPermission = useCallback(async () => {
    const request = getRequestPermission();
    if (!request) {
      setGyroGranted(true);
      return true;
    }
    try {
      const result = await request();
      if (result === "granted") {
        setGyroGranted(true);
        return true;
      }
    } catch {
      /* Denegado o llamado fuera de un gesto de usuario: seguimos sin giroscopio. */
    }
    return false;
  }, []);

  return { pointer, target, needsGyroPermission, source, requestGyroPermission };
}
