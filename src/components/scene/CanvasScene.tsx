import { memo } from "react";
import { OrbitControls, PerspectiveCamera, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

// Продакшен-импорты всех элементов диорамы
import { FloatingIsland } from "./FloatingIsland";
import { Rocks } from "./Rocks";
import { Portal } from "./Portal";
import { FloatingRocks } from "./FloatingRocks";
import { Trees } from "./Trees";
import { Words } from "./Words";
import { Grass } from "./Grass";
import { SceneParticles } from "./SceneParticles";
import { PostProcessingEffects } from "./PostProcessingEffects";

// ОПТИМИЗАЦИЯ ПАМЯТИ (Глобальные константы): Идеально для плавности кадра
const LIGHT_COLOR = new THREE.Color(1, 0.2, 0.1);
const CAMERA_TARGET = new THREE.Vector3(1, 5, 0);
const SPOTLIGHT_POSITION: [number, number, number] = [1.19, 10.85, -4.45];
const CAMERA_POSITION: [number, number, number] = [-1.75, 10.85, 20.35];

const SPOTLIGHT_ANGLE = 60.65 * (Math.PI / 180);

interface CanvasSceneProps {
  isMobile: boolean;
}

export const CanvasScene = memo(function CanvasScene({ isMobile }: CanvasSceneProps) {
  return (
    <>
      {/* Карты окружения (HDRI) неба и отражений */}
      <Environment background='only' files='textures/bg.hdr' />
      <Environment background={false} files='textures/envmap.hdr' />

      {/* Синхронное покачивание острова в невесомости */}
      <Float speed={0.5} rotationIntensity={0.6} floatIntensity={0.6}>
        <spotLight
          penumbra={1}
          distance={500}
          angle={SPOTLIGHT_ANGLE}
          intensity={0.3}
          color={LIGHT_COLOR}
          position={SPOTLIGHT_POSITION}
        />

        <Portal isMobile={isMobile} />
        <Rocks />
        <FloatingIsland />
        <Trees />
        <Words />
        <Grass />
        <SceneParticles />
      </Float>

      <FloatingRocks />

      {/* Интегрируем слой кинематографичных пост-эффектов */}
      <PostProcessingEffects isMobile={isMobile} />

      <PerspectiveCamera makeDefault fov={50} position={CAMERA_POSITION} />

      <OrbitControls
        target={CAMERA_TARGET}
        maxPolarAngle={Math.PI * 0.5}
        makeDefault
        enablePan={false} // Запрещаем сдвиг мыши правой кнопкой, чтобы не ломать портал
      />
    </>
  );
});
