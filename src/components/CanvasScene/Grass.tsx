import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function Grass() {
  const gltf = useGLTF("models/grass.glb");

  useEffect(() => {
    if (!gltf) return;

    // Используем traverse для безопасного обхода всех мешей травы
    gltf.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;

        if (mesh.material && !Array.isArray(mesh.material)) {
          const material = mesh.material as THREE.MeshStandardMaterial;

          // Использование alphaToCoverage для корректного рендеринга прозрачных краев травы
          material.alphaToCoverage = true;

          // Включаем поддержку прозрачности в материале
          material.transparent = true;

          // Делаем рендеринг травинок двухсторонним
          material.side = THREE.DoubleSide;

          // ЗАЩИЩЕННАЯ ПРОВЕРКА ТЕКСТУРЫ:
          // Если Three.js потерял текстуру в .map, мы проверяем, не спряталась ли она в .emissiveMap
          const activeTexture = material.map || material.emissiveMap;

          if (activeTexture) {
            // Принудительно возвращаем текстуру на место в основной цвет
            material.map = activeTexture;
            // Синхронизируем её со слотом самосвечения
            material.emissiveMap = activeTexture;
            // Задаем умеренную яркость свечения, чтобы убрать белый засвет
            material.emissive = new THREE.Color(0.3, 0.3, 0.3);
          } else {
            // Хак-заглушка: если модель экспортировалась вообще без текстуры,
            // красим траву в красивый темно-зеленый неоновый цвет вместо белых плит
            material.color = new THREE.Color(0.05, 0.2, 0.05);
            material.emissive = new THREE.Color(0.02, 0.1, 0.02);
          }

          // Принудительно заставляем Three.js обновить шейдер в видеопамяти
          material.needsUpdate = true;
        }
      }
    });
  }, [gltf]);

  return <primitive object={gltf.scene} />;
}

// Предзагрузка ассета травы в память для удержания стабильного FPS
useGLTF.preload("models/grass.glb");
