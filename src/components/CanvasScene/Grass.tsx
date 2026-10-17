// Оптимизированный src/components/CanvasScene/Grass.tsx
import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export function Grass() {
  const gltf = useGLTF("models/grass.glb");
  const { viewport } = useThree();
  const isMobile = viewport.width < 6;

  useEffect(() => {
    if (!gltf) return;

    gltf.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;

        if (mesh.material && !Array.isArray(mesh.material)) {
          const material = mesh.material as THREE.MeshStandardMaterial;

          if (isMobile) {
            // На мобильных alphaTest работает в разы быстрее, чем тяжелый alphaToCoverage
            material.alphaToCoverage = false;
            material.transparent = false;
            material.alphaTest = 0.5; // Жестко отсекаем края текстуры травы
            material.side = THREE.FrontSide; // Рендерим только лицевую сторону на смартфонах
          } else {
            material.alphaToCoverage = true;
            material.transparent = true;
            material.side = THREE.DoubleSide;
          }

          const activeTexture = material.map || material.emissiveMap;
          if (activeTexture) {
            material.map = activeTexture;
            material.emissiveMap = activeTexture;
            material.emissive = new THREE.Color(0.15, 0.15, 0.15); // Приглушаем свечение
          } else {
            material.color = new THREE.Color(0.05, 0.2, 0.05);
            material.emissive = new THREE.Color(0.02, 0.1, 0.02);
          }

          material.needsUpdate = true;
        }
      }
    });
  }, [gltf, isMobile]);

  return <primitive object={gltf.scene} />;
}

useGLTF.preload("models/grass.glb");
