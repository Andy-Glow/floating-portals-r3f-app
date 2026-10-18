import { memo, Suspense, lazy } from "react";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Float,
} from "@react-three/drei";
import * as THREE from "three";

// Импорты компонентов диорамы
import { FloatingIsland } from "./FloatingIsland";
import { Rocks } from "./Rocks";
import { Portal } from "./Portal";
import { FloatingRocks } from "./FloatingRocks";
import { Trees } from "./Trees";
import { Words } from "./Words";
import { Grass } from "./Grass";
import { SceneParticles } from "./SceneParticles";

// ЖЕСТКАЯ ИЗОЛЯЦИЯ ЭФФЕКТОВ ДЛЯ СТАРЫХ ПК:
// Импортируем файл эффектов динамически. Теперь Vite соберет его в отдельный чанк-файл.
// Слабый графический чип старого ноутбука в легаси-режиме его даже не скачает!
const PostProcessingEffects = lazy(() =>
  import("./PostProcessingEffects").then((module) => ({
    default: module.PostProcessingEffects,
  })),
);

// Константы конфигурации, вынесенные из рендера для плавности FPS
const LIGHT_COLOR = new THREE.Color(1, 0.2, 0.1);
const CAMERA_TARGET = new THREE.Vector3(1, 5, 0);
const SPOTLIGHT_POSITION: [number, number, number] = [1.19, 10.85, -4.45];
const CAMERA_POSITION: [number, number, number] = [-1.75, 10.85, 20.35];

const SPOTLIGHT_ANGLE = 60.65 * (Math.PI / 180);

interface CanvasSceneProps {
  isModernGPU: boolean;
}

export const CanvasScene = memo(function CanvasScene({
  isModernGPU,
}: CanvasSceneProps) {
  return (
    <>
      {/* Тяжелые HDR карты космоса и отражений */}
      <Environment background="only" files="textures/bg.hdr" />
      <Environment background={false} files="textures/envmap.hdr" />

      {/* Синхронное парение диорамы острова */}
      <Float speed={0.5} rotationIntensity={0.6} floatIntensity={0.6}>
        <spotLight
          penumbra={1}
          distance={500}
          angle={SPOTLIGHT_ANGLE}
          intensity={0.3}
          color={LIGHT_COLOR}
          position={SPOTLIGHT_POSITION}
        />

        <Portal />
        <Rocks />
        <FloatingIsland />
        <Trees />
        <Words />
        <Grass />
        <SceneParticles />
      </Float>

      <FloatingRocks />

      {/* Включаем тяжелую постобработку только на мощных GPU и только через Suspense */}
      {isModernGPU && (
        <Suspense fallback={null}>
          <PostProcessingEffects />
        </Suspense>
      )}

      <PerspectiveCamera
        makeDefault
        fov={50}
        position={CAMERA_POSITION}
      />
      
      <OrbitControls
        target={CAMERA_TARGET}
        maxPolarAngle={Math.PI * 0.5}
        makeDefault
        enablePan={false} // Запрещаем сдвиг осей для удержания стабильности параллакса портала
      />
    </>
  );
});

