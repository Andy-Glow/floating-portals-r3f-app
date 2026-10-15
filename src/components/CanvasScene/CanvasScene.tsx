import { memo, Suspense } from "react";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { FloatingIsland } from "./FloatingIsland";
import { Rocks } from "./Rocks";
import { Portal } from "./Portal";
import { FloatingRocks } from "./FloatingRocks";

export const CanvasScene = memo(function CanvasScene() {
  return (
    <Suspense fallback={null}>
      {/* Задний фон сцены (текстура) */}
      <Environment
        background="only"
        files="textures/bg.hdr" // Vite: без process.env и без ведущего слэша "/"
      />

      {/* Карта отражений для материалов (HDR) */}
      <Environment
        background={false}
        files="textures/envmap.hdr" // Vite: относительный путь для GitHub Pages
      />

      <FloatingIsland />
      <Rocks />
      <Portal />
      <FloatingRocks />

      {/* Настройка камеры автора */}
      <PerspectiveCamera
        makeDefault
        fov={50}
        position={[-1.75, 10.85, 20.35]}
      />

      {/* Контроллер камеры с ограничением вращения под землю */}
      <OrbitControls
        target={new THREE.Vector3(1, 5, 0)}
        maxPolarAngle={Math.PI * 0.5}
        makeDefault
      />
    </Suspense>
  );
});
