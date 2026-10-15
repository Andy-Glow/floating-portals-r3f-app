import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function Portal() {
  const model = useGLTF("models/portal.glb");
  const mask = useGLTF("models/portal_mask.glb");

  useEffect(() => {
    // 1. Настройка материалов для рамки портала
    if (model && model.scene.children.length > 0) {
      const modelMesh = model.scene.children[0] as THREE.Mesh;

      if (modelMesh.material && !Array.isArray(modelMesh.material)) {
        const material = modelMesh.material as THREE.MeshStandardMaterial;
        // Усиливаем интенсивность отражения HDR-карты для красивого блеска арки
        material.envMapIntensity = 3.5;
      }
    }

    // 2. Настройка материалов для маски (входа в портал)
    if (mask && mask.scene.children.length > 0) {
      const maskMesh = mask.scene.children[0] as THREE.Mesh;

      if (maskMesh.material && !Array.isArray(maskMesh.material)) {
        const material = maskMesh.material as THREE.MeshStandardMaterial;
        // Делаем материал двухсторонним, чтобы портал не исчезал при облете камеры сзади
        material.side = THREE.DoubleSide;
      }
    }
  }, [model, mask]);

  return (
    <>
      <primitive object={model.scene} />
      <primitive object={mask.scene} />
    </>
  );
}

// Предзагружаем оба ассета для удержания стабильного FPS кадра
useGLTF.preload("models/portal.glb");
useGLTF.preload("models/portal_mask.glb");
