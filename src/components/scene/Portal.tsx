import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FillQuad } from "./FillQuad";

// Строго указываем TypeScript, что компонент принимает флаг мобильного устройства
interface PortalProps {
  isMobile: boolean;
}

export function Portal({ isMobile }: PortalProps) {
  // Асинхронно загружаем оригинальные 3D-модели каменной рамки и плоскости-маски из кэша Drei
  const modelGltf = useGLTF("models/portal.glb");
  const maskGltf = useGLTF("models/portal_mask.glb");

  // Создаем ссылку на изолированную виртуальную сцену, где будет рендериться скрытый космос
  const internalSceneRef = useRef<THREE.Scene>(null);

  // Извлекаем физические размеры окна рендеринга из контекста Three.js
  const { size } = useThree();

  // МОБИЛЬНАЯ ОПТИМИЗАЦИЯ: На смартфонах делим разрешение скрытого рендеринга на 1.5.
  // Это в разы разгружает пиксельные конвейеры мобильных GPU, сохраняя стабильные 60 FPS.
  const targetResolutionDivider = isMobile ? 1.5 : 1;

  // Загружаем панорамную текстуру вселенной для проецирования внутрь портала
  const galaxyTexture = useTexture("textures/galaxy.jpg", (texture) => {
    if (!Array.isArray(texture)) {
      texture.colorSpace = THREE.SRGBColorSpace; // Включаем правильное цветовое пространство sRGB
      texture.mapping = THREE.EquirectangularReflectionMapping; // Сферическое (панорамное) отображение
      texture.minFilter = THREE.LinearFilter; // Линейная фильтрация для сглаживания пикселей
      texture.generateMipmaps = false; // Отключаем генерацию мип-мап для экономии видеопамяти
    }
  });

  /**
   * ЭТАЛОННАЯ НАСТРОЙКА АССЕТОВ (Защита React Compiler):
   * Клонируем рамку и маску, изолируя операции от глобального кэша Drei.
   * Функция срабатывает строго при изменении исходных моделей или флага устройства.
   */
  const optimizedScenes = useMemo(() => {
    if (!modelGltf || !maskGltf) return null;

    // Создаем глубокие независимые копии объектов Three.js
    const clonedModel = modelGltf.scene.clone(true);
    const clonedMask = maskGltf.scene.clone(true);

    // Настраиваем материалы каменной рамки портала
    clonedModel.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        if (mesh.material && !Array.isArray(mesh.material)) {
          // На смартфонах приглушаем интенсивность отражений HDR-карты, чтобы не перегружать шейдер
          (mesh.material as THREE.MeshStandardMaterial).envMapIntensity = isMobile ? 1.5 : 3.5;
        }
      }
    });

    // Настраиваем низкоуровневую работу трафарета (Stencil) на геометрии маски
    clonedMask.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        object.renderOrder = 5; // Маска обязана отрендериться строго ПЕРЕД полноэкранным FillQuad
        const mesh = object as THREE.Mesh;
        if (mesh.material && !Array.isArray(mesh.material)) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.side = THREE.DoubleSide; // Двухсторонний рендеринг для стабильности под любым углом обзора
          material.transparent = false;
          material.depthWrite = true; // Записываем маску в буфер глубины кадра

          // НАСТРОЙКА СТЕНСИЛ-КОНВЕЙЕРА:
          material.stencilWrite = true; // Разрешаем запись в буфер трафарета
          material.stencilRef = 1; // Присваиваем пикселям этой геометрии идентификационный номер = 1
          material.stencilFunc = THREE.AlwaysStencilFunc; // Записывать значение всегда, без предварительных проверок
          material.stencilZPass = THREE.ReplaceStencilOp; // Заменять старое значение трафарета на stencilRef (на единицу)
        }
      }
    });

    return { model: clonedModel, mask: clonedMask };
  }, [modelGltf, maskGltf, isMobile]);

  // Создаем виртуальный буфер рендеринга (Offscreen Framebuffer) под размер экрана
  const target = useMemo(() => {
    return new THREE.WebGLRenderTarget(
      Math.floor(size.width / targetResolutionDivider),
      Math.floor(size.height / targetResolutionDivider),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        depthBuffer: true, // Буфер глубины необходим для корректного параллакса объектов внутри
        stencilBuffer: true, // Буфер трафарета связывает маску проема арки с финальным выводом
      },
    );
  }, [size.width, size.height, targetResolutionDivider]);

  // КРИТИЧЕСКАЯ УТИЛИЗАЦИЯ: При размонтировании портала принудительно очищаем видеопамять от буфера
  useEffect(() => {
    return () => target.dispose();
  }, [target]);

  // СУПЕР-ЗАХВАТ КАДРА (Render Loop): Каждый кадр разворачиваем камеру в скрытую сцену
  // космоса, фотографируем её в WebGLRenderTarget и возвращаем рендерер к основной диораме.
  useFrame((state) => {
    if (!internalSceneRef.current) return;
    state.gl.setRenderTarget(target); // Перенаправляем поток вычислений GPU во внутренний буфер
    state.gl.render(internalSceneRef.current, state.camera); // Отрисовываем изолированную вселенную
    state.gl.setRenderTarget(null); // Возвращаем рендерер на стандартный экран пользователя
  });

  // Если 3D-клоны или текстуры еще компилируются — удерживаем отрисовку
  if (!optimizedScenes) return null;

  return (
    <>
      {/* Изолированная сцена «другого измерения» */}
      <scene ref={internalSceneRef} background={galaxyTexture} />

      {/* Каменная рамка портала */}
      <primitive object={optimizedScenes.model} />

      {/* Невидимая плоскость-заглушка, размечающая пиксели в буфере трафарета */}
      <primitive object={optimizedScenes.mask} />

      {/* Финальный полноэкранный меш, выводящий текстуру космоса строго внутри маски */}
      <FillQuad map={target.texture} maskId={1} />
    </>
  );
}

// Предзагрузка ассетов в оперативную память для обеспечения плавного старта без микрофризов
useGLTF.preload("models/portal.glb");
useGLTF.preload("models/portal_mask.glb");
