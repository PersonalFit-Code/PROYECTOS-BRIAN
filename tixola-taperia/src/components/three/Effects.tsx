"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export interface EffectsProps {
  /** profile.postprocessing → solo en tier "high" */
  enabled: boolean;
}

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
 */
export default function Effects({ enabled }: EffectsProps) {
  const software = useSoftwareRenderer();
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={software ? 0 : 4} enableNormalPass={false} stencilBuffer={false}>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.3} radius={0.7} levels={6} />
      <Vignette eskil={false} offset={0.28} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
