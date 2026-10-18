import { memo, useState, useEffect } from "react";
import {
  OrbitControls,
  PerspectiveCamera,
  Float,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { FloatingIsland } from "./FloatingIsland";
import { Rocks } from "./Rocks";
import { FloatingRocks } from "./FloatingRocks";
import { Trees } from "./Trees";
import { Words } from "./Words";
import { Grass } from "./Grass";
import { SceneParticles } from "./SceneParticles";
import { LegacyPortal } from "./LegacyPortal";

const CAMERA_TARGET = new THREE.Vector3(1, 5, 0);
const CAMERA_POSITION: [number, number, number] = [-1.75, 10.85, 20.35];

export const LegacyScene = memo(function LegacyScene() {
  // Стейт отложенного включения тяжелого HDR-окружения
  const [showEnvironment, setShowEnvironment] = useState(false);

  useEffect(() => {
    // Включаем HDR-небо через 500мс после монтирования сцены,
    // когда бенчмарк FPS и прелоадер уже полностью завершили свою работу.
    // Это уберет пиковую нагрузку на VRAM старых ПК.
    const timer = setTimeout(() => {
      setShowEnvironment(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Пока HDR подгружается, удерживаем легкий базовый фон */}
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={0.4} color="#ffaa99" />

      {/* Безопасный запуск карт окружения по таймеру */}
      {showEnvironment && (
        <>
          <Environment background="only" files="textures/bg.hdr" />
          <Environment background={false} files="textures/envmap.hdr" />
        </>
      )}

      {/* Облегченное покачивание диорамы */}
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

      <PerspectiveCamera
        makeDefault
        fov={50}
        position={CAMERA_POSITION}
      />
      
      <OrbitControls
        target={CAMERA_TARGET}
        maxPolarAngle={Math.PI * 0.48}
        makeDefault
        enablePan={false}
      />
    </>
  );
});

