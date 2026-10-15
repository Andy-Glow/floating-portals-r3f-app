import { memo, Suspense } from "react";
import { OrbitControls, PerspectiveCamera, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { FloatingIsland } from "./FloatingIsland";
import { Rocks } from "./Rocks";
import { Portal } from "./Portal";
import { FloatingRocks } from "./FloatingRocks";
import { Trees } from "./Trees";
import { Words } from "./Words";
import { Grass } from "./Grass";

export const CanvasScene = memo(function CanvasScene() {
  return (
    <Suspense fallback={null}>
      {/* Задний фон сцены (текстура) */}
      <Environment background='only' files='textures/bg.hdr' />

      {/* Карта отражений для материалов (HDR) */}
      <Environment background={false} files='textures/envmap.hdr' />

      {/* ГЛАВНЫЙ ЭФФЕКТ ПАРЕНИЯ ОСТРОВА: Медленная скорость 0.5, легкое вращение и покачивание 0.6 */}
      <Float speed={0.5} rotationIntensity={0.6} floatIntensity={0.6}>
        <Portal />
        <Rocks />
        <FloatingIsland />
        <Trees />
        <Words />
        <Grass />
      </Float>

      {/* Парящие глыбы оставляем вне общего флоата, так как у них свои независимые настройки Float внутри компонента */}
      <FloatingRocks />

      {/* Настройка камеры автора */}
      <PerspectiveCamera makeDefault fov={50} position={[-1.75, 10.85, 20.35]} />

      {/* Контроллер камеры с ограничением вращения под землю */}
      <OrbitControls
        target={new THREE.Vector3(1, 5, 0)}
        maxPolarAngle={Math.PI * 0.5}
        makeDefault
      />
    </Suspense>
  );
});
