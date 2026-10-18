import { useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

// ОПТИМИЗАЦИЯ ПАМЯТИ: Выносим фиксированные параметры трансформаций во внешние константы.
// чтобы не тратить ресурсы на создание новых массивов при каждом кадре.
const PORTAL_PLANE_POS: [number, number, number] = [1.1, 8.5, -4.1]; // Ваша идеальная позиция плоскости
const PORTAL_PLANE_ROT: [number, number, number] = [0, 0, 0]; // Нулевой разворот плоскости
const PORTAL_PLANE_SCALE: [number, number, number] = [2.8, 4.4, 1]; // Масштаб под размер проема арки
const GEOMETRY_ARGS: [number, number] = [1, 1]; // Базовые размеры плоскости

export function LegacyPortal() {
  // Загружаем оригинальную 3D-модель рамки портала из кэша Drei
  const model = useGLTF("models/portal.glb");

  // Загружаем облегченную текстуру космоса для старых систем
  const legacyGalaxy = useTexture("textures/legacy-galaxy.jpg", (texture) => {
    if (!Array.isArray(texture)) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    }
  });

  /**
   * ИЗОЛИРОВАННАЯ ОПТИМИЗАЦИЯ МОДЕЛИ (Без useEffect и мутаций):
   * Клонируем рамку портала и настраиваем её материалы внутри одного useMemo.
   * React Compiler полностью одобряет этот подход, так как мы не изменяем глобальный кэш Drei.
   */
  const optimizedModelScene = useMemo(() => {
    if (!model) return null;

    // Создаем глубокую независимую копию модели рамки портала
    const clone = model.scene.clone(true);

    clone.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        if (mesh.material && !Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;

          // Облегчаем физические параметры материала рамки
          mat.roughness = 0.6;
          mat.metalness = 0.1;

          // СДЕЛАЛИ РАМКУ ЯРЧЕ: Увеличиваем интенсивность самосвечения и
          // задаем теплый багровый оттенок, чтобы проявить рельеф камня в глубокой тени
          mat.emissive.setRGB(0.12, 0.05, 0.08);
          mat.emissiveIntensity = 2.5;

          // Сигнализируем WebGL-контексту, что шейдер материала обновился
          mat.needsUpdate = true;
        }
      }
    });

    return clone;
  }, [model]);

  // Шейдер для космоса с изменением цвета, яркости и математическим скруглением углов
  const customArcMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: legacyGalaxy },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D map;
        void main() {
          vec4 texColor = texture2D(map, vUv);
          
          // Математическое скругление верха под купол оригинальной арки
          float alpha = 1.0;
          if (vUv.y > 0.52) {
            float dx = abs(vUv.x - 0.5);
            float normalizedY = (vUv.y - 0.52) / 0.48;
            if (dx > sqrt(1.0 - normalizedY * normalizedY) * 0.5) {
              alpha = 0.0;
            }
          }
          // Физически отбрасываем (не рендерим) пиксели за пределами купола арки
          if (alpha < 0.1) discard;

          // ЦВЕТОКОРРЕКЦИЯ КОСМОСА ПОД БАГРОВЫЙ СТИЛЬ:
          vec3 finalColor = texColor.rgb;
          
          // 1. Сдвигаем спектр в сторону красного (усиливаем красный канал, приглушаем зеленый)
          finalColor.r *= 1.3;
          finalColor.g *= 0.8;
          
          // 2. Делаем картинку космоса сочнее и ярче в 1.8 раза, компенсируя отсутствие блума
          finalColor *= 1.8;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide, // Текстура видна и спереди, и сзади плоскости
      transparent: true,
      depthWrite: true, // Позволяет корректно взаимодействовать с геометрией острова
    });
  }, [legacyGalaxy]);

  // Удерживаем рендеринг, пока ассеты загружаются по сети
  if (!optimizedModelScene || !legacyGalaxy) return null;

  return (
    <group>
      {/* Выводим безопасный, изолированный клон рамки портала */}
      <primitive object={optimizedModelScene} />

      {/* Оптимизированная плоскость космоса с вашими точными координатами */}
      <mesh position={PORTAL_PLANE_POS} rotation={PORTAL_PLANE_ROT} scale={PORTAL_PLANE_SCALE}>
        <planeGeometry args={GEOMETRY_ARGS} />
        <primitive object={customArcMaterial} attach='material' />
      </mesh>
    </group>
  );
}

// Предзагрузка ассета рамки в память для стабильного FPS при первом старте приложения
useGLTF.preload("models/portal.glb");
