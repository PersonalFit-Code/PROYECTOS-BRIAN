"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export interface EffectsProps {
  /** profile.postprocessing → solo en tier "high" */
  enabled: boolean;
  /**
   * Qué lienzo lo pide. Los dos comparten este módulo —y por tanto el chunk asíncrono del paquete
   * `postprocessing`, que se descarga una sola vez— pero no el ajuste:
   *  · "hero": bloom generoso sobre brasas y aceite + viñeta del propio composer.
   *  · "map":  bloom discreto sobre las ventanas doradas y el neón, SIN viñeta, porque el visor del
   *            mapa ya lleva la suya como degradado CSS por encima del lienzo.
   */
  preset?: "hero" | "map";
}

interface BloomPreset {
  intensity: number;
  luminanceThreshold: number;
  luminanceSmoothing: number;
  radius: number;
  vignette: boolean;
}

const PRESETS: Record<"hero" | "map", BloomPreset> = {
  hero: { intensity: 0.85, luminanceThreshold: 0.62, luminanceSmoothing: 0.3, radius: 0.7, vignette: true },
  map: { intensity: 0.6, luminanceThreshold: 0.78, luminanceSmoothing: 0.2, radius: 0.65, vignette: false },
};

/** Nombres de los renderizadores por software (sin GPU) más habituales. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i;

/**
 * ¿Está WebGL emulado por software? Ocurre en máquinas sin GPU utilizable, escritorio remoto,
 * navegadores con la aceleración desactivada y entornos headless.
 *
 * Importa porque esos renderizadores no manejan bien los render targets multimuestreados: el
 * composer entrega un fotograma en negro y la portada se queda vacía. Ahí se pide `multisampling: 0`
 * (el bloom y el tone mapping siguen funcionando; solo se pierde el suavizado de bordes).
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

/**
 * Post-procesado: bloom suave sobre brasas/aceite, viñeta y tone mapping ACES.
 * Notas:
 *  - Al renderizar a través del composer three no aplica su tone mapping, por eso se añade
 *    explícitamente el pase ACES (mismo look que el render directo en tiers sin bloom).
 *  - `multisampling` también hay que pedirlo aquí: la escena va al render target del composer, así
 *    que el `antialias: true` del Canvas no interviene y con 0 el borde de la tixola, el mango y
 *    las conchas salían dentados justo en el tier mejor (el medio, sin composer, sí tiene MSAA).
 *    Se desactiva cuando WebGL corre por software, donde el multimuestreo deja la escena en negro.
 *
 * Este módulo lo cargan con `next/dynamic` tanto HeroScene como CityMap3D, y ninguno de los dos lo
 * importa de forma estática: el barril de `@react-three/postprocessing` arrastra el paquete
 * `postprocessing` entero con sus 37 clases de efecto (GodRays, SSAO, DepthOfField, SMAA, LUT3D…)
 * para que aquí se usen tres. Al cargarlo aparte, la gama media —que no enciende el post-procesado—
 * no llega a pedir ese chunk nunca, y la alta lo pide UNA vez para los dos lienzos.
 */
export default function Effects({ enabled, preset = "hero" }: EffectsProps) {
  const software = useSoftwareRenderer();
  if (!enabled) return null;
  const cfg = PRESETS[preset];
  return (
    /* `multisampling` 2 en vez de 4: el MSAA del render target del composer es la pasada que peor
       llevan las GPU integradas, y con 2 muestras el borde del mango y de las conchas ya se lee
       limpio a cualquier dpr ≥ 1,5. `levels` 4 en vez de 6: cada nivel del bloom con mipmapBlur son
       dos pasadas a pantalla completa (13 → 9), y los niveles 5 y 6 desenfocan a 1/32 y 1/64 de
       resolución —un halo tan amplio que la viñeta posterior lo vuelve a oscurecer—. El resplandor
       grande de la portada lo pinta el shader del Backdrop, no el bloom: no se pierde nada. */
    <EffectComposer multisampling={software ? 0 : 2} enableNormalPass={false} stencilBuffer={false}>
      <Bloom
        mipmapBlur
        intensity={cfg.intensity}
        luminanceThreshold={cfg.luminanceThreshold}
        luminanceSmoothing={cfg.luminanceSmoothing}
        radius={cfg.radius}
        levels={4}
      />
      {cfg.vignette && <Vignette eskil={false} offset={0.28} darkness={0.55} />}
      {/* Los materiales HDR del mapa y de la portada son `toneMapped: false`: sin este pase, la
          versión con bloom saldría sin el ACES de `onCreated` y con los dorados reventados. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
