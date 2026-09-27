"use client";

import { useCallback, useSyncExternalStore, type RefObject } from "react";

/**
 * Visibilidad en pantalla con UN IntersectionObserver COMPARTIDO por configuración.
 *
 * Sustituye al `useInView` de Framer Motion en los sitios donde solo se necesita saber si algo está a
 * la vista para PAUSAR una animación o para montar un bloque pesado. Framer entra en el árbol con su
 * propio ciclo de vida y arrastra el paquete entero a componentes que por lo demás no animan nada; aquí
 * el coste es un observador por pareja (umbral, margen) para TODA la web y una lectura con
 * `useSyncExternalStore`, el mismo patrón que ya usa ReviewMarquee para las media queries.
 *
 * Aviso: el elemento se observa cuando React ejecuta la suscripción (tras el commit), así que el `ref`
 * debe apuntar a un nodo que exista en ese momento — no a uno que aparezca más tarde por un render
 * condicional.
 */

export interface InViewOptions {
  /** Fracción del elemento que debe verse para considerarlo visible (0 = cualquier píxel). */
  amount?: number;
  /** Margen del área de observación, sintaxis de `rootMargin` (admite px y %). */
  rootMargin?: string;
}

interface Pool {
  observer: IntersectionObserver;
  /** Último estado conocido por nodo: es la fuente de `getSnapshot`. */
  visible: WeakMap<Element, boolean>;
  listeners: Map<Element, Set<() => void>>;
}

/* Un pool por configuración: varias secciones con el mismo umbral comparten observador. */
const pools = new Map<string, Pool>();
/* Trinquete de `useInViewOnce`. Vive fuera de React para que el valor se lea en `getSnapshot` y no haga
   falta un setState en un efecto (que provocaría un render en cascada por cada sección que entra). */
const latched = new WeakSet<Element>();

const keyOf = (amount: number, rootMargin: string) => `${amount}|${rootMargin}`;

function poolFor(amount: number, rootMargin: string): Pool {
  const key = keyOf(amount, rootMargin);
  const existing = pools.get(key);
  if (existing) return existing;

  const listeners = new Map<Element, Set<() => void>>();
  const visible = new WeakMap<Element, boolean>();
  const observer = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        /* Solo se avisa en los cambios reales: el observador dispara también al empezar a observar. */
        if (visible.get(record.target) === record.isIntersecting) continue;
        visible.set(record.target, record.isIntersecting);
        const set = listeners.get(record.target);
        /* Copia de la lista: un oyente puede darse de baja dentro de su propia llamada (el trinquete). */
        if (set) for (const notify of [...set]) notify();
      }
    },
    { threshold: amount, rootMargin },
  );

  const pool: Pool = { observer, visible, listeners };
  pools.set(key, pool);
  return pool;
}

/** Empieza a observar `el` en `pool` y devuelve la baja. */
function observe(pool: Pool, el: Element, notify: () => void): () => void {
  let set = pool.listeners.get(el);
  if (!set) {
    set = new Set();
    pool.listeners.set(el, set);
    pool.observer.observe(el);
  }
  set.add(notify);

  return () => {
    set.delete(notify);
    /* Último interesado: se deja de observar y se olvida el estado (sin fugas al desmontar). */
    if (set.size === 0) {
      pool.listeners.delete(el);
      pool.observer.unobserve(el);
      pool.visible.delete(el);
    }
  };
}

/** ¿Está el elemento a la vista AHORA? Cambia en los dos sentidos (entra y sale). */
export function useInView<T extends Element>(ref: RefObject<T | null>, options: InViewOptions = {}): boolean {
  const { amount = 0, rootMargin = "0px" } = options;

  const subscribe = useCallback(
    (onChange: () => void) => {
      const el = ref.current;
      if (!el) return () => {};
      return observe(poolFor(amount, rootMargin), el, onChange);
    },
    [ref, amount, rootMargin],
  );

  const getSnapshot = useCallback(() => {
    const el = ref.current;
    if (!el) return false;
    return pools.get(keyOf(amount, rootMargin))?.visible.get(el) ?? false;
  }, [ref, amount, rootMargin]);

  /* En servidor nada está en pantalla: el HTML se emite en el estado "en reposo" (animaciones pausadas). */
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * Igual, pero con trinquete: una vez visto, se queda en `true` para siempre y deja de observar.
 * Para lo que solo debe ocurrir una vez (montar un bloque pesado, arrancar una entrada).
 */
export function useInViewOnce<T extends Element>(ref: RefObject<T | null>, options: InViewOptions = {}): boolean {
  const { amount = 0, rootMargin = "0px" } = options;

  const subscribe = useCallback(
    (onChange: () => void) => {
      const el = ref.current;
      /* Ya visto en un montaje anterior: no hay nada que observar, el snapshot ya devuelve true. */
      if (!el || latched.has(el)) return () => {};

      const pool = poolFor(amount, rootMargin);
      let release: (() => void) | null = null;
      const notify = () => {
        if (!pool.visible.get(el)) return;
        latched.add(el);
        release?.();
        release = null;
        onChange();
      };
      release = observe(pool, el, notify);
      return () => {
        release?.();
        release = null;
      };
    },
    [ref, amount, rootMargin],
  );

  const getSnapshot = useCallback(() => {
    const el = ref.current;
    if (!el) return false;
    return latched.has(el) || (pools.get(keyOf(amount, rootMargin))?.visible.get(el) ?? false);
  }, [ref, amount, rootMargin]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
