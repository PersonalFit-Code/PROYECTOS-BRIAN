"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

/**
 * Presupuesto de rendimiento del sitio.
 *
 * Tras la decisión del cliente ("que funcione en todos los dispositivos, bajarle calidad, quitar el
 * 3D de Three.js") aquí ya no se decide NADA de WebGL: no hay Canvas, ni sombras, ni post-procesado,
 * ni partículas que dimensionar. Lo único que sigue hace falta saber es si el dispositivo es modesto,
 * para moderar los efectos CSS caros (scroll interpolado, pins con scrub, parallax, bucles ambientales
 * y el `backdrop-filter` del cristal) y para respetar `prefers-reduced-motion`.
 *
 * El modelo también se simplifica: la gama se decide UNA vez por pestaña, al hidratar, a partir de lo
 * que el navegador declara del equipo. Antes existía una sonda de fotogramas que medía la escena 3D y
 * podía bajar la gama a los dos segundos; vivía dentro del Canvas y ha desaparecido con él. Que no haya
 * medición es ahora una ventaja: ningún interruptor cambia a mitad de demo (el tacto del scroll y el
 * desenfoque del cristal se fijan antes del primer scroll y no se mueven).
 *
 * El precio de no medir es que la heurística tiene que ser PRUDENTE: si se equivoca hacia arriba, nadie
 * lo va a corregir después. Por eso "high" —la gama que enciende Lenis y el cristal real— pide un
 * escritorio holgado y no un escritorio cualquiera (ver `detectDevice`).
 */

export type PerformanceTier = "low" | "mid" | "high";

/**
 * Catálogo de cosas caras. La pregunta que se hace un componente no es "¿qué gama soy?" sino
 * "¿me puedo permitir esto?": si el día de mañana los capítulos bajan a gama media, se cambia aquí
 * y no en los ficheros que lo consultan.
 *
 * La lista se ha quedado en lo que de verdad consulta alguien. Se han borrado `scene3d`,
 * `postprocessing` y `shadows` (eran WebGL) y también `grain`, `carousel3d`, `glass` y `heavyBlur`,
 * que ya no pregunta ningún componente: el grano y el cristal los decide la hoja global (ver
 * `syncGlassSwitch`) y el carrusel cilíndrico de platos es CSS y se monta siempre.
 */
export type PerfFeature =
  /** Scroll suavizado con Lenis. */
  | "smoothScroll"
  /** Capítulos cinematográficos: pin + scrub de GSAP. */
  | "scrollCinema"
  /** Parallax por scroll. */
  | "parallax"
  /** Bucles decorativos infinitos (marquesinas, flotaciones, brasas, vaho). */
  | "ambientMotion"
  /** Animaciones de entrada puntuales, que empiezan y terminan. */
  | "entranceMotion";

export interface PerfProfile {
  tier: PerformanceTier;
  /** El usuario pide menos movimiento: apaga toda animación, sea de la gama que sea. */
  reducedMotion: boolean;
  /** ¿La gama activa llega al menos a `min`? */
  atLeast: (min: PerformanceTier) => boolean;
  /** ¿Me puedo permitir esta característica con la gama activa? */
  can: (feature: PerfFeature) => boolean;
}

/** Gama mínima que exige cada característica. */
const FEATURE_MIN_TIER: Record<PerfFeature, PerformanceTier> = {
  smoothScroll: "mid",
  scrollCinema: "mid",
  parallax: "mid",
  ambientMotion: "mid",
  entranceMotion: "low",
};

/* ──────────────────────────────────────────────────────────────
   Almacén (fuera de React: la gama es una sola por pestaña)
   ────────────────────────────────────────────────────────────── */

/**
 * Instantánea serializada `tier|reducedMotion`. Se usa un string porque `useSyncExternalStore`
 * compara instantáneas por identidad: un string es estable y el objeto de perfil se deriva de él
 * con `useMemo`.
 */
type Snapshot = string;

/** Perfil "low" durante SSR/hidratación para no hidratar con efectos pesados. */
const SERVER_SNAPSHOT: Snapshot = "low|0";

interface DeviceFlags {
  isMobile: boolean;
  isTouch: boolean;
  reducedMotion: boolean;
  /** El navegador pide ahorro de datos. */
  saveData: boolean;
  tier: PerformanceTier;
}

let device: DeviceFlags | null = null;
let snapshot: Snapshot = SERVER_SNAPSHOT;
let detected = false;

const RANK: Record<PerformanceTier, number> = { low: 0, mid: 1, high: 2 };
/** Un escalón por debajo. Se usa para el ahorro de datos, que baja una gama y no hasta el suelo. */
const LOWER: Record<PerformanceTier, PerformanceTier> = { high: "mid", mid: "low", low: "low" };

function detectDevice(): DeviceFlags {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData ?? false;

  /* Movimiento reducido: preferencia explícita del usuario, manda sobre todo lo demás. */
  if (reducedMotion) {
    return { isMobile, isTouch, reducedMotion, saveData, tier: "low" };
  }

  /* Suelo duro: con 2 GB o 2 núcleos no se le pide al compositor ni un pin ni un desenfoque. */
  if (memory <= 2 || cores <= 2) {
    return { isMobile, isTouch, reducedMotion, saveData, tier: "low" };
  }

  /*
   * Móvil y táctil se quedan en "mid". El escritorio solo sube a "high" si además declara 8 núcleos y
   * 4 GB o más.
   *
   * El listón es DELIBERADAMENTE alto porque esta heurística ya no es un punto de partida que una sonda
   * de fotogramas corregía a los dos segundos: es la decisión FINAL y nada puede bajarla después. Con el
   * umbral antiguo ("cualquier escritorio no táctil con más de 2 núcleos") un portátil modesto se
   * llevaba las dos cosas más caras que quedan en la web —Lenis interpolando el scroll por fotograma y
   * los ~41 `backdrop-filter: blur(18-22px)` de las superficies de cristal— sin ninguna vía de
   * degradación. Eso va en contra de lo que pidió el cliente ("que funcione en todos los dispositivos,
   * bajarle calidad") y es exactamente el riesgo que no se puede correr en el portátil de una
   * presentación. Con 8 núcleos y 4 GB declarados el equipo ya no es "un escritorio cualquiera".
   *
   * `deviceMemory` no existe en Firefox ni en Safari y cae al valor por defecto de 4, así que el filtro
   * de memoria no los excluye: el que decide ahí es el número de núcleos, que sí publican todos.
   *
   * Qué queda a cada lado: en "mid" hay revelados, vaho, parallax y capítulos con pin, y lo que se pierde
   * es el scroll interpolado (el nativo responde antes) y el `backdrop-filter` del cristal, que son justo
   * las dos cosas que en un equipo flojo se notan como lentitud y no como "menos efectos".
   * Lo que no depende de esto es la portada: se pinta igual en cualquier gama porque solo usa
   * `transform` y `opacity`, sin filtros ni desenfoques.
   *
   * VERIFICAR EN EL EQUIPO DE LA DEMO con `?perf=1`: el HUD dice la gama y las banderas que la han
   * decidido. Si ahí sale "mid" y el scroll se quiere suave, se sube el listón a mano; si sale "high" y
   * se nota pastoso, se baja. Medir fotogramas en vivo para decidirlo volvería a meter un bucle de
   * `requestAnimationFrame` permanente y un cambio de tacto a mitad de sesión, que es el fallo que ya
   * se vio delante de un cliente.
   */
  const desktopHigh = !isMobile && !isTouch && cores >= 8 && memory >= 4;
  const base: PerformanceTier = desktopHigh ? "high" : "mid";

  /* Ahorro de datos: UN escalón, no el modo mínimo. Es una preferencia de RED, no un veredicto sobre
     la potencia del equipo; bajar a "low" con candado le servía la web plana a un visitante de móvil
     cuyo único problema es el plan de datos. */
  return { isMobile, isTouch, reducedMotion, saveData, tier: saveData ? LOWER[base] : base };
}

/**
 * Interruptor ÚNICO del cristal real: escribe `data-gpu="high"` en <html> y con él se reactivan los
 * `backdrop-filter` de `.glass`, `.glass-smoke`, `.glass-red` y de la banda de la cabecera
 * (`src/app/globals.css`). Sin esta línea el selector de la hoja sería CSS muerto y el cristal no
 * volvería NUNCA, en ningún equipo: la decisión "el cristal real se reserva a gama alta" se
 * convertiría en "el cristal real se elimina".
 *
 * Antes exigía gama alta Y MEDIDA por la sonda, porque el peor momento para añadir una recomposición
 * del viewport por superficie era mientras la escena 3D iba a pleno rendimiento. Sin escena ya no hay
 * sonda, así que el resguardo lo pone ahora el listón de la propia gama (escritorio no táctil, 8
 * núcleos, 4 GB y sin ahorro de datos): son ~41 superficies desenfocando lo que tienen detrás, y sin
 * medición en vivo no queda nadie que pueda apagarlas si el equipo no llega. El interruptor se acciona
 * una sola vez, antes del primer scroll, en vez de encenderse y apagarse solo.
 */
function syncGlassSwitch(tier: PerformanceTier): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (tier === "high") root.dataset.gpu = "high";
  else if (root.dataset.gpu) delete root.dataset.gpu;
}

function ensureDetected(): void {
  if (detected) return;
  detected = true;
  device = detectDevice();
  snapshot = [device.tier, device.reducedMotion ? 1 : 0].join("|");
}

function getSnapshot(): Snapshot {
  ensureDetected();
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

/**
 * Suscripción vacía A PROPÓSITO: la gama se mide una vez al hidratar y ya no cambia, así que no hay
 * nada que notificar. `useSyncExternalStore` sigue siendo la herramienta correcta porque resuelve lo
 * que aquí importa —renderizar el HTML del servidor con el perfil conservador y saltar al real justo
 * después de montar, sin `setState` dentro de un efecto ni desajuste de hidratación—.
 */
function subscribe(): () => void {
  return () => {};
}

/* ──────────────────────────────────────────────────────────────
   Perfil derivado
   ────────────────────────────────────────────────────────────── */

function parseSnapshot(value: Snapshot): PerfProfile {
  const [rawTier, rawReduced] = value.split("|");
  const tier: PerformanceTier = rawTier === "high" || rawTier === "mid" ? rawTier : "low";
  const reducedMotion = rawReduced === "1";

  /* Todas las características que quedan SON movimiento, así que `prefers-reduced-motion` las apaga
     todas sin excepción y no hace falta la lista de "cuáles son movimiento" que había antes. Si algún
     día vuelve una que sea caro puro y no movimiento (el cristal lo era), habrá que distinguirlas. */
  const can = (feature: PerfFeature): boolean =>
    !reducedMotion && RANK[tier] >= RANK[FEATURE_MIN_TIER[feature]];

  return {
    tier,
    reducedMotion,
    atLeast: (min) => RANK[tier] >= RANK[min],
    can,
  };
}

/**
 * Perfil de rendimiento activo: gama heurística (escritorio holgado "high"; móvil, táctil y escritorio
 * justo "mid"; equipo muy justo o `prefers-reduced-motion` "low"; ahorro de datos un escalón menos) más
 * la preferencia de movimiento. Devuelve un perfil "low" durante SSR/hidratación y el real justo después.
 */
export function usePerformanceTier(): PerfProfile {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  /* El atributo del cristal y el HUD se escriben desde un EFECTO y nunca desde `getSnapshot`: tocar el
     DOM durante el render (y `<html>` es DOM) se ejecutaría en medio de la hidratación y en desarrollo
     dos veces. Los dos son idempotentes, así que da igual cuántos consumidores del hook haya. */
  useEffect(applyDomSideEffects, [value]);
  return useMemo(() => parseSnapshot(value), [value]);
}

/** Efectos en el DOM derivados de la gama: interruptor del cristal y HUD de diagnóstico. */
function applyDomSideEffects(): void {
  syncGlassSwitch(device?.tier ?? "low");
  renderDiagnostics();
}

/** Azúcar para el caso más común: "¿puedo permitirme esto?" en una línea. */
export function useCanAfford(feature: PerfFeature): boolean {
  return usePerformanceTier().can(feature);
}

/* ──────────────────────────────────────────────────────────────
   Interruptor de diagnóstico
   ────────────────────────────────────────────────────────────── */

/**
 * HUD de desarrollo: gama activa y banderas del dispositivo en pantalla, para poder verificar en un
 * equipo real qué rama de la heurística ha caído. Ya no muestra FPS: la sonda que los medía vivía
 * dentro del Canvas y se ha ido con él; medir fotogramas por nuestra cuenta volvería a meter un bucle
 * de `requestAnimationFrame` permanente para adornar un HUD que un visitante nunca ve.
 *
 * Se enciende con `?perf=1` en la URL y se apaga con `?perf=0`; la elección queda en
 * `sessionStorage` para que sobreviva a la navegación entre idiomas y secciones. Un visitante
 * normal nunca lo ve: sin el parámetro no existe ni el nodo.
 *
 * Se pinta con DOM imperativo y no con un componente React a propósito: así no entra en el árbol
 * que se hidrata (nada que comparar con el HTML del servidor) y no añade un render más.
 */
const DIAGNOSTICS_PARAM = "perf";
const DIAGNOSTICS_KEY = "tixola:perf-hud";

let hud: HTMLElement | null = null;
let hudChecked = false;

function diagnosticsEnabled(): boolean {
  try {
    const raw = new URLSearchParams(window.location.search).get(DIAGNOSTICS_PARAM);
    if (raw !== null) {
      const on = raw === "1" || raw === "on" || raw === "true";
      if (on) window.sessionStorage.setItem(DIAGNOSTICS_KEY, "1");
      else window.sessionStorage.removeItem(DIAGNOSTICS_KEY);
      return on;
    }
    return window.sessionStorage.getItem(DIAGNOSTICS_KEY) === "1";
  } catch {
    /* Safari en privado lanza al tocar sessionStorage; sin HUD se sigue igual de bien. */
    return false;
  }
}

function renderDiagnostics(): void {
  if (typeof document === "undefined") return;
  if (!hudChecked) {
    hudChecked = true;
    if (!diagnosticsEnabled()) return;
    hud = document.createElement("div");
    hud.dataset.perfHud = "";
    hud.setAttribute("aria-hidden", "true");
    hud.style.cssText = [
      "position:fixed",
      "left:8px",
      "bottom:8px",
      "z-index:2147483647",
      "pointer-events:none",
      "padding:6px 10px",
      "border-radius:6px",
      "background:rgba(10,10,10,0.82)",
      "color:#f1e2cc",
      "font:11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace",
      "letter-spacing:0.02em",
      "white-space:pre",
    ].join(";");
    document.body.appendChild(hud);
  }
  if (!hud) return;
  const d = device;
  hud.textContent = [
    `tier  ${d?.tier ?? "—"}`,
    `glass ${d?.tier === "high" ? "sí" : "no"}`,
    `flags ${d?.isMobile ? "mobile " : ""}${d?.isTouch ? "touch " : ""}${d?.reducedMotion ? "rm " : ""}${d?.saveData ? "savedata" : ""}`.trimEnd(),
  ].join("\n");
}
