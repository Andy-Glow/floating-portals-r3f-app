import { memo, useEffect } from "react";
import { OrbitControls, PerspectiveCamera, Float, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import { FloatingIsland } from "./FloatingIsland";
import { Rocks } from "./Rocks";
import { FloatingRocks } from "./FloatingRocks";
import { Trees } from "./Trees";
import { Words } from "./Words";
import { Grass } from "./Grass";
import { SceneParticles } from "./SceneParticles";
import { LegacyPortal } from "./LegacyPortal";

// Статические параметры трансформаций и камеры вынесены за пределы рендеринга.
const CAMERA_TARGET = new THREE.Vector3(1, 5, 0);
const CAMERA_POSITION: [number, number, number] = [-1.75, 10.85, 20.35];

// Явно описываем интерфейс структуры данных кэша GLTF для типизации
interface GLTFCacheResult {
  scene: THREE.Group;
}

export const LegacyScene = memo(function LegacyScene() {
  // Оптимизация под старое железо
  useEffect(() => {
    const optimizeMaterials = (cacheKey: string) => {
      try {
        // Безопасно извлекаем загруженный ассет из глобального реестра Drei useGLTF
        const asset = (
          useGLTF as unknown as {
            clear: (path: string) => void;
            peek: (path: string) => GLTFCacheResult | undefined;
          }
        ).peek(cacheKey);
        if (!asset || !asset.scene) return;

        asset.scene.traverse((object: THREE.Object3D) => {
          // Проверяем, является ли объект полигональной сеткой (Mesh)
          if (object instanceof THREE.Mesh && object.material) {
            const mat = object.material;
            if (Array.isArray(mat)) return;

            // Жестко сбрасываем параметры шейдеров до базовых значений, разгружая GPU
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.roughness = 1.0; // Отключаем блики
              mat.metalness = 0.0; // Отключаем расчеты металлических отражений
              if (mat.envMap) mat.envMap = null; // Вырезаем тяжелые текстурные карты окружения
              mat.needsUpdate = true; // Команда видеокарте пересобрать шейдер меша
            }
          }
        });
      } catch {
        // catch без предупреждений
      }
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

    // Запускаем оптимизацию материалов с микро-задержкой, когда ассеты точно сели в кэш памяти
    const timer = setTimeout(() => {
      models.forEach(optimizeMaterials);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* HDR-карты окружения для проявления запеченных теней острова */}
      <Environment background='only' files='textures/bg.hdr' />
      <Environment background={false} files='textures/envmap.hdr' />

      {/* Облегченное парение: уменьшили интенсивность покачивания, снижая нагрузку на CPU */}
      <Float speed={0.2} rotationIntensity={0.2} floatIntensity={0.2}>
        <LegacyPortal />
        <Rocks />
        <FloatingIsland />
        <Trees />
        <Words />
        <Grass />
        <SceneParticles />
      </Float>

      <FloatingRocks />

      <PerspectiveCamera makeDefault fov={50} position={CAMERA_POSITION} />

      <OrbitControls
        target={CAMERA_TARGET}
        maxPolarAngle={Math.PI * 0.48}
        makeDefault
        enablePan={false}
      />
    </>
  );
});
