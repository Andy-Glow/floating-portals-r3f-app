import {
  EffectComposer,
  DepthOfField,
  HueSaturation,
  BrightnessContrast,
  ChromaticAberration,
} from "@react-three/postprocessing";
import * as THREE from "three";

// ОПТИМИЗАЦИЯ ПАМЯТИ: Выносим векторы конфигурации эффектов во внешние константы.
// Теперь JavaScript не создает новые объекты Three.js при каждом цикле отрисовки экрана.
const CHROMATIC_OFFSET = new THREE.Vector2(0.00175, 0.00175); // Коэффициент сдвига каналов линзы
const DOF_TARGET: [number, number, number] = [1.19, 10.85, -4.45]; // Координаты точки фокуса резкости

interface PostProcessingEffectsProps {
  isMobile: boolean; // Описываем тип свойства флага устройства для TypeScript
}

export function PostProcessingEffects({ isMobile }: PostProcessingEffectsProps) {
  return (
    // Глобальный контейнер сборщика пост-эффектов с включенной поддержкой трафаретного буфера
    <EffectComposer stencilBuffer={true}>
      {/* АДАПТИВНОЕ РАЗМЫТИЕ БОКЕ (Depth of Field):
          Эффект камеры-обскуры включается строго ТОЛЬКО НА КОМПЬЮТЕРАХ.
          Мобильные графические чипы полностью избавлены от этого тяжелого алгоритма фильтрации пикселей. */}
      {!isMobile && (
        <DepthOfField
          target={DOF_TARGET}
          focalLength={1.5} // Фокусное расстояние виртуальной линзы
          bokehScale={0.5} // Размер дисков размытия на переднем и заднем планах
        />
      )}

      {/* КОРРЕКЦИЯ НАСЫЩЕННОСТИ: Слегка приглушаем общую цветовую гамму (-0.15), 
          чтобы придать сцене мрачную, таинственную космическую атмосферу */}
      <HueSaturation hue={0} saturation={-0.15} />

      {/* ПОДЧЕРКИВАНИЕ КОНТРАСТА: Делаем тени глубже, а светящиеся неоновые огоньки сочнее (+0.035),
          что визуально компенсирует отсутствие блума на мобильных экранах */}
      <BrightnessContrast brightness={0.0} contrast={0.035} />

      {/* ХРОМАТИЧЕСКАЯ АБЕРРАЦИЯ: Имитирует искажение краев линзы реального фотоаппарата, 
          слегка смещая красный и синий цветовые каналы ближе к углам монитора */}
      <ChromaticAberration
        radialModulation={true} // Усиление эффекта раздвоения цвета по краям экрана
        offset={CHROMATIC_OFFSET}
      />
    </EffectComposer>
  );
}
