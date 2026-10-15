import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function Trees() {
  // Наш стандарт: относительный путь для корректного деплоя
  const gltf = useGLTF("models/trees.glb");

  useEffect(() => {
    if (!gltf) return;

    // Метод traverse обходит всё дерево объектов внутри загруженной 3D-модели
    gltf.scene.traverse((object) => {
      // Безопасная проверка: является ли текущий объект полигональной сеткой (Mesh)
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;

        // Проверяем наличие материала и то, что он не является массивом
        if (mesh.material && !Array.isArray(mesh.material)) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          // Устанавливаем интенсивность отражения HDR карты
          material.envMapIntensity = 2.5;
        }
      }
    });
  }, [gltf]);

  return <primitive object={gltf.scene} />;
}

// Предзагрузка ассета для плавного рендеринга без фризов
useGLTF.preload("models/trees.glb");
