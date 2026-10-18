import { memo } from "react";
import { OrbitControls, PerspectiveCamera, Environment, Float } from "@react-three/drei";
import {
  EffectComposer,
  DepthOfField,
  HueSaturation,
  BrightnessContrast,
  ChromaticAberration,
} from "@react-three/postprocessing";
import * as THREE from "three";

// ИМПОРТЫ ВНУТРЕННИХ ОБЪЕКТОВ ДИОРАМЫ:
import { FloatingIsland } from "./FloatingIsland";
import { Rocks } from "./Rocks";
import { Portal } from "./Portal";
import { FloatingRocks } from "./FloatingRocks";
import { Trees } from "./Trees";
import { Words } from "./Words";
import { Grass } from "./Grass";
import { SceneParticles } from "./SceneParticles";

// ОПТИМИЗАЦИЯ ПАМЯТИ: Выносим создание всех тяжелых объектов Three.js за пределы компонента.
// Это предотвращает их повторное создание в памяти (Garbage Collection) при каждом перерендере.
const LIGHT_COLOR = new THREE.Color(1, 0.2, 0.1); // Багровый цвет прожектора
const CAMERA_TARGET = new THREE.Vector3(1, 5, 0); // Точка, на которую смотрит камера
const CHROMATIC_OFFSET = new THREE.Vector2(0.00175, 0.00175); // Сдвиг цветовых каналов
const DOF_TARGET: [number, number, number] = [1.19, 10.85, -4.45]; // Точка фокуса для размытия заднего плана
const SPOTLIGHT_POSITION: [number, number, number] = [1.19, 10.85, -4.45]; // Координаты прожектора
const CAMERA_POSITION: [number, number, number] = [-1.75, 10.85, 20.35]; // Начальная позиция камеры

// Заранее вычисляем угол конуса света в радианах (60.65 градусов), экономя такты процессора
const SPOTLIGHT_ANGLE = 60.65 * (Math.PI / 180);

interface CanvasSceneProps {
  isModernGPU: boolean;
}

export const CanvasScene = memo(function CanvasScene({ isModernGPU }: CanvasSceneProps) {
  return (
    <>
      {/* КАРТЫ ОКРУЖЕНИЯ (HDRI): bg.hdr рендерит видимое космическое небо на заднем плане, 
          а envmap.hdr используется скрыто только для генерации реалистичных бликов на деревьях и камнях */}
      <Environment background='only' files='textures/bg.hdr' />
      <Environment background={false} files='textures/envmap.hdr' />

      {/* ГЛОБАЛЬНЫЙ КОНТЕЙНЕР АНИМАЦИИ: Все объекты внутри тега Float плавно покачиваются синхронно,
          создавая иллюзию парения острова в невесомости */}
      <Float speed={0.5} rotationIntensity={0.6} floatIntensity={0.6}>
        {/* НАПРАВЛЕННЫЙ ПРОЖЕКТОР (Rim Light): Находится позади острова и подсвечивает края 
            деревьев и камней багровым контурным светом, отделяя их от темного фона неба */}
        <spotLight
          penumbra={1} // Мягкие, сглаженные края светового пятна
          distance={500} // Дистанция затухания луча
          angle={SPOTLIGHT_ANGLE}
          intensity={0.3}
          color={LIGHT_COLOR}
          position={SPOTLIGHT_POSITION}
        />

        {/* Интеграция ключевых 3D-ассетов диорамы */}
        <Portal />
        <Rocks />
        <FloatingIsland />
        <Trees />
        <Words />
        <Grass />
        <SceneParticles />
      </Float>

      {/* ВНЕШНИЕ ОБЪЕКТЫ: Камни FloatingRocks вынесены за пределы Float, 
          так как у них настроены собственные, независимые циклы парения */}
      <FloatingRocks />

      {/* КИНЕМАТОГРАФИЧНАЯ ПОСТОБРАБОТКА: Включается только на мощных видеокартах с поддержкой WebGL 2.0 */}
      {isModernGPU && (
        <EffectComposer stencilBuffer={true}>
          {/* Эффект глубины резкости (камера-обскура): размывает объекты, которые находятся ближе или дальше точки фокуса */}
          <DepthOfField
            target={DOF_TARGET}
            focalLength={1.5} // Фокусное расстояние виртуальной линзы
            bokehScale={0.5} // Размер дисков размытия
          />
          {/* Снижаем общую цветовую насыщенность диорамы для придания мрачной атмосферы */}
          <HueSaturation hue={0} saturation={-0.15} />
          {/* Слегка подкручиваем контрастность, делая тени глубже, а свет сочнее */}
          <BrightnessContrast brightness={0.0} contrast={0.035} />
          {/* Эффект дефекта линзы: слегка размывает и смещает красный/синий каналы по краям экрана */}
          <ChromaticAberration
            radialModulation={true} // Усиление эффекта ближе к углам монитора
            offset={CHROMATIC_OFFSET}
          />
        </EffectComposer>
      )}

      {/* ВИРТУАЛЬНАЯ КАМЕРА: Перспективная камера с углом обзора 50 градусов */}
      <PerspectiveCamera
        makeDefault // Устанавливаем эту камеру главной для рендерера Three.js
        fov={50}
        position={CAMERA_POSITION}
      />

      {/* ИНТЕРАКТИВНОЕ УПРАВЛЕНИЕ: Позволяет пользователю вращать и приближать сцену мышкой или тачем */}
      <OrbitControls
        target={CAMERA_TARGET}
        maxPolarAngle={Math.PI * 0.5} // Ограничиваем вращение, чтобы пользователь не мог заглянуть под низ сцены
        makeDefault
        enablePan={false}
      />
    </>
  );
});
