// src/components/scene/FloatingIsland.tsx
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function FloatingIsland() {
  // Загружаем оригинальную 3D-модель из глобального кэша Drei
  const gltf = useGLTF("models/floating_island.glb");

  /**
   * ОПТИМИЗАЦИЯ И НАСТРОЙКА (Без useEffect и useRef):
   * Мы создаем изолированную и полностью настроенную копию сцены внутри useMemo.
   * React Compiler полностью одобряет этот подход, так как здесь нет сайд-эффектов,
   * нет изменения рефов во время рендера и нет круговых зависимостей.
   */
  const optimizedScene = useMemo(() => {
    if (!gltf) return null;

    // 1. Создаем глубокую независимую копию 3D-модели
    const clone = gltf.scene.clone(true);
    if (!clone.children || clone.children.length === 0) return clone;

    // 2. Извлекаем первый меш острова из склонированного дерева
    const mesh = clone.children[0] as THREE.Mesh;

    if (mesh) {
      // 3. Генерируем uv2 слой для карты запеченного света (LightMap), если его нет
      if (mesh.geometry && mesh.geometry.attributes.uv && !mesh.geometry.attributes.uv2) {
        const uvs = mesh.geometry.attributes.uv.array;
        mesh.geometry.setAttribute("uv2", new THREE.BufferAttribute(uvs, 2));
      }

      // 4. Перенастраиваем свойства физического материала меша
      if (mesh.material && !Array.isArray(mesh.material)) {
        const material = mesh.material as THREE.MeshStandardMaterial;

        if (material.map) {
          material.lightMap = material.map; // Назначаем базовую текстуру в слот запеченных теней (LightMap)
          material.lightMapIntensity = 400; // Глубина теней скал
          material.color.setRGB(0.04, 0.06, 0.1); // Цвет тона острова
          material.needsUpdate = true; // Отдаем команду WebGL-контексту принудительно обновить шейдер материала
        }
      }
    }
    return clone; // Возвращаем полностью готовый, настроенный объект Three.js
  }, [gltf]);

  if (!optimizedScene) return null; // Если файл модели еще загружается по сети, ничего не рендерим

  return <primitive object={optimizedScene} />; // Рендерим изолированную, настроенную копию острова
}

// Предзагрузка ассета в память для стабильного FPS при старте приложения
useGLTF.preload("models/floating_island.glb");
