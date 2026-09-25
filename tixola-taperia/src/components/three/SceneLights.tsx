"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ContactShadows } from "@react-three/drei";
import type { PerfProfile } from "@/hooks/usePerformanceTier";

export interface SceneLightsProps {
  profile: PerfProfile;
}

/**
 * Iluminación "de brasas": ambiente burdeos muy bajo, foco rojo pimentón desde arriba-izquierda,
 * contraluz dorado desde atrás, relleno crema suave y un punto rojo bajo la sartén.
 * Sin `<Environment>` (evita descargar HDRs): el aspecto se consigue solo con luces.
 * Sombras únicamente en `profile.shadows` (tier high): foco con shadow map + ContactShadows.
 */
export default function SceneLights({ profile }: SceneLightsProps) {
  // Objetivo del foco dentro del grupo de la sartén (se añade a la escena con <primitive>).
  const spotTarget = useMemo(() => new THREE.Object3D(), []);

  return (
    <>
      <ambientLight color="#3a0e13" intensity={1.3} />
      <hemisphereLight args={["#4a1a1f", "#0a0a0a", 0.55]} />

      {/* Luz principal: rojo pimentón, desde arriba-izquierda */}
      <spotLight
        color="#d8323c"
        intensity={150}
        position={[-3.2, 6.5, 3.5]}
        angle={0.5}
        penumbra={0.75}
        decay={2}
        distance={0}
        target={spotTarget}
        castShadow={profile.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <primitive object={spotTarget} position={[0, 0.3, 0]} />

      {/* Contraluz dorado: perfila el borde de la tixola y las conchas */}
      <directionalLight color="#e8c27a" intensity={2.4} position={[3.5, 3, -5]} />

      {/* Relleno crema muy suave desde la cámara para leer el volumen */}
      <directionalLight color="#f9f6f0" intensity={0.5} position={[2, 4, 6]} />

      {/* Brasas bajo la sartén */}
      <pointLight color="#ff3b2a" intensity={26} distance={6} decay={2} position={[0, -0.9, 0]} />

      {profile.shadows && (
        <ContactShadows position={[0, -1.55, 0]} opacity={0.65} scale={9} blur={2.6} far={3.2} resolution={256} color="#000000" />
      )}
    </>
  );
}
