import { memo, useEffect } from "react";
import {
  OrbitControls,
  PerspectiveCamera,
  Float,
  useGLTF,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { FloatingIsland } from "./FloatingIsland";
import { Rocks } from "./Rocks";
import { FloatingRocks } from "./FloatingRocks";
import { Trees } from "./Trees";
import { Words } from "./Words";
import { Grass } from "./Grass";
import { SceneParticles } from "./SceneParticles";
import { LegacyPortal } from "./LegacyPortal"; // Наш легкий статичный портал

const lightColor = new THREE.Color(1, 0.2, 0.1);

export const LegacyScene = memo(function LegacyScene() {
  // Оптимизируем материалы основных моделей под старый GPU
  useEffect(() => {
    const optimizeMaterials = (cacheKey: string) => {
      try {
        const asset = useGLTF.peek(cacheKey) as any;
        if (!asset || !asset.scene) return;

        asset.scene.traverse((object: any) => {
          if (object.isMesh && object.material) {
            const mat = object.material;
            if (Array.isArray(mat)) return;

            mat.roughness = 1.0;
            mat.metalness = 0.0;
            if (mat.envMap) mat.envMap = null;
            mat.needsUpdate = true;
          }
        });
      } catch (e) {}
    };

    const models = [
      "models/floating_island.glb",
      "models/rocks.glb",
      "models/floating_rock_1.glb",
      "models/floating_rock_2.glb",
      "models/floating_rock_3.glb",
      "models/trees.glb",
      "models/grass.glb",
    ];

    const timer = setTimeout(() => {
      models.forEach(optimizeMaterials);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Environment background="only" files="textures/bg.hdr" />
      <Environment background={false} files="textures/envmap.hdr" />

      <Float speed={0.2} rotationIntensity={0.2} floatIntensity={0.2}>
        {/* Статичный портал сам натянет картинку на полотно */}
        <LegacyPortal />

        <Rocks />
        <FloatingIsland />
        <Trees />
        <Words />
        <Grass />
        <SceneParticles />
      </Float>

      <FloatingRocks />

      <PerspectiveCamera
        makeDefault
        fov={50}
        position={[-1.75, 10.85, 20.35]}
      />
      <OrbitControls
        target={new THREE.Vector3(1, 5, 0)}
        maxPolarAngle={Math.PI * 0.48}
        makeDefault
      />
    </>
  );
});
