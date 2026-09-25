"use client";

import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export interface EffectsProps {
  /** profile.postprocessing → solo en tier "high" */
  enabled: boolean;
}

/**
 * Post-procesado: bloom suave sobre brasas/aceite, viñeta y tone mapping ACES.
 * Nota: al renderizar a través del composer three no aplica su tone mapping, por eso se
 * añade explícitamente el pase ACES (mismo look que el render directo en tiers sin bloom).
 */
export default function Effects({ enabled }: EffectsProps) {
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false} stencilBuffer={false}>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.3} radius={0.7} levels={6} />
      <Vignette eskil={false} offset={0.28} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
