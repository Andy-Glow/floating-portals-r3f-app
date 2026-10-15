import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function FloatingIsland() {
  const gltf = useGLTF("models/floating_island.glb");

  useEffect(() => {
    if (!gltf || !gltf.scene.children[0]) return;

    // Строгое приведение типов: children[0] в Three.js по умолчанию является базовым Object3D
    // Мы приводим его к Mesh, чтобы TS знал о наличии геометрии и материала
    const mesh = gltf.scene.children[0] as THREE.Mesh;

    // Проверяем, что у меша действительно есть геометрия
    if (mesh.geometry && mesh.geometry.attributes.uv) {
      const uvs = mesh.geometry.attributes.uv.array;

      // Создаем второй сет UV-координат для запеченной карты теней/света (LightMap)
      mesh.geometry.setAttribute("uv2", new THREE.BufferAttribute(uvs, 2));
    }

    // Приведение типа материала. Материал может быть массивом, проверяем на одиночный MeshStandardMaterial
    if (mesh.material && !Array.isArray(mesh.material)) {
      const material = mesh.material as THREE.MeshStandardMaterial;

      // Автор переназначает стандартную текстуру (map) в качестве карты освещения (lightMap)
      if (material.map) {
        material.lightMap = material.map;
        material.lightMapIntensity = 400;

        // Задаем глубокий темный оттенок базовому цвету острова
        material.color = new THREE.Color(0.04, 0.06, 0.1);
      }
    }
  }, [gltf]);

  return <primitive object={gltf.scene} />;
}

// Полезный хак R3F для предзагрузки ассета в память, чтобы сцена не заикалась при рендере
useGLTF.preload("models/floating_island.glb");
