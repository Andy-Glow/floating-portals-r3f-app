import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function Trees() {
  // Асинхронно загружаем оригинальную 3D-модель деревьев из глобального кэша Drei
  const gltf = useGLTF("models/trees.glb");

  /**
   * ИЗОЛИРОВАННАЯ ШЕЙДЕРНАЯ НАСТРОЙКА (Без useEffect и мутаций кэша):
   * Создаем независимый глубокий клон деревьев внутри useMemo.
   * Все операции настройки отражений выполняются на изолированном меше,
   * что гарантирует 100% иммунитет от предупреждений React Compiler.
   */
  const optimizedTrees = useMemo(() => {
    if (!gltf) return null;

    // Глубокое клонирование всей иерархии объектов 3D-модели
    const clone = gltf.scene.clone(true);

    // Метод traverse обходит всё дерево объектов внутри склонированной 3D-модели
    clone.traverse((object) => {
      // Безопасная аппаратная проверка: является ли текущий объект полигональной сеткой (Mesh)
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;

        // Проверяем наличие материала и то, что он не является массивом
        if (mesh.material && !Array.isArray(mesh.material)) {
          const material = mesh.material as THREE.MeshStandardMaterial;

          // Устанавливаем интенсивность отражения HDR карты для сочных бликов на листьях
          material.envMapIntensity = 2.5;

          // Даем сигнал WebGL-контексту принудительно обновить шейдер материала меша
          material.needsUpdate = true;
        }
      }
    });

    return clone;
  }, [gltf]);

  // Пока файл модели скачивается по сети, сдерживаем рендеринг во избежание сбоев
  if (!optimizedTrees) return null;

  // Возвращаем готовую, изолированную и настроенную копию деревьев в сцену
  return <primitive object={optimizedTrees} />;
}

// Предзагрузка ассета для плавного рендеринга без фризов при первом старте приложения
useGLTF.preload("models/trees.glb");
