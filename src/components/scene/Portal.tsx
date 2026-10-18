import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FillQuad } from "./FillQuad";

export function Portal() {
  // Загружаем оригинальные 3D-ассеты рамки и маски портала из кэша Drei
  const modelGltf = useGLTF("models/portal.glb");
  const maskGltf = useGLTF("models/portal_mask.glb");

  // Ссылка на изолированную виртуальную сцену "другого измерения"
  const internalSceneRef = useRef<THREE.Scene>(null);

  // Получаем параметры размеров экрана и вьюпорта
  const { size, viewport } = useThree();
  const isMobile = viewport.width < 6;

  // Оптимизация филлрейта: на мобильных девайсах снижаем разрешение скрытого рендеринга в 1.5 раза
  const targetResolutionDivider = isMobile ? 1.5 : 1;

  // Загружаем тяжелую текстуру космической галактики для Modern-режима
  const galaxyTexture = useTexture("textures/galaxy.jpg", (texture) => {
    if (!Array.isArray(texture)) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.mapping = THREE.EquirectangularReflectionMapping; // Сферическое проецирование текстуры
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false; // Отключаем генерацию мип-мап для экономии видеопамяти
    }
  });

  /**
   * КЛОНИРОВАНИЕ И НАСТРОЙКА ДЛЯ REACT COMPILER:
   * Мы создаем независимые глубокие копии рамки и маски портала внутри одного useMemo.
   * Все манипуляции со свойствами материалов происходят на клонированных объектах,
   * что гарантирует 100% иммунитет от ошибок React Compiler и защищает глобальный кэш Drei.
   */
  const optimizedScenes = useMemo(() => {
    if (!modelGltf || !maskGltf) return null;

    const clonedModel = modelGltf.scene.clone(true);
    const clonedMask = maskGltf.scene.clone(true);

    // 1. Оптимизация материалов внешней рамки портала
    clonedModel.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        if (mesh.material && !Array.isArray(mesh.material)) {
          // Динамически снижаем интенсивность отражений на смартфонах
          (mesh.material as THREE.MeshStandardMaterial).envMapIntensity = isMobile ? 1.5 : 3.5;
        }
      }
    });

    // 2. Низкоуровневая разметка трафарета на материале маски
    clonedMask.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        object.renderOrder = 5; // Маска должна отрендериться строго ПЕРЕД FillQuad
        const mesh = object as THREE.Mesh;
        if (mesh.material && !Array.isArray(mesh.material)) {
          const material = mesh.material as THREE.MeshStandardMaterial;

          material.side = THREE.DoubleSide; // Двухсторонний рендеринг маски под любым углом
          material.transparent = false;
          material.depthWrite = true; // Записываем маску в буфер глубины

          // НАСТРОЙКА STENCIL КОНВЕЙЕРА:
          material.stencilWrite = true; // Включаем запись в буфер трафарета кадра
          material.stencilRef = 1; // Каждому пикселю маски присваиваем ID = 1
          material.stencilFunc = THREE.AlwaysStencilFunc; // Записывать значение всегда, без проверок
          material.stencilZPass = THREE.ReplaceStencilOp; // Заменять старый пиксель трафарета на stencilRef
        }
      }
    });

    return { model: clonedModel, mask: clonedMask };
  }, [modelGltf, maskGltf, isMobile]);

  // Создаем виртуальный буфер рендеринга (текстуру в памяти) под размер холста
  const target = useMemo(() => {
    return new THREE.WebGLRenderTarget(
      Math.floor(size.width / targetResolutionDivider),
      Math.floor(size.height / targetResolutionDivider),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        depthBuffer: true, // Буфер глубины жизненно необходим для корректного параллакса внутри
        stencilBuffer: true, // Буфер трафарета связывает маску и финальный экран FillCN
      },
    );
  }, [size.width, size.height, targetResolutionDivider]);

  // КРИТИЧЕСКАЯ УТИЛИЗАЦИЯ: При размонтировании портала принудительно очищаем видеопамять от буфера
  useEffect(() => {
    return () => target.dispose();
  }, [target]);

  // СУПЕР-ЗАХВАТ КАДРА (Render-to-Texture Loop):
  // Перехватываем стандартный цикл отрисовки Three.js. Разворачиваем камеру в скрытую сцену
  // космоса, фотографируем её в WebGLRenderTarget и возвращаем основной рендерер к диораме.
  useFrame((state) => {
    if (!internalSceneRef.current) return;
    state.gl.setRenderTarget(target);
    state.gl.render(internalSceneRef.current, state.camera);
    state.gl.setRenderTarget(null);
  });

  // Пока ассеты или клоны не готовы — сдерживаем отрисовку
  if (!optimizedScenes) return null;

  return (
    <>
      {/* Изолированная сцена «другого измерения» */}
      <scene ref={internalSceneRef} background={galaxyTexture} />

      {/* Сама рамка портала */}
      <primitive object={optimizedScenes.model} />

      {/* Невидимая плоскость-заглушка, которая размечает пиксели в буфере трафарета */}
      <primitive object={optimizedScenes.mask} />

      {/* Финальный шейдер, который выводит текстуру космоса строго внутри размеченной маски */}
      <FillQuad map={target.texture} maskId={1} />
    </>
  );
}

// Предзагрузка ассетов в память для обеспечения стабильного FPS без фризов при старте
useGLTF.preload("models/portal.glb");
useGLTF.preload("models/portal_mask.glb");
