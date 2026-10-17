import { memo, Suspense } from "react";
import { OrbitControls, PerspectiveCamera, Environment, Float } from "@react-three/drei";
import {
  EffectComposer,
  DepthOfField,
  HueSaturation,
  BrightnessContrast,
  ChromaticAberration,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { FloatingIsland } from "./FloatingIsland";
import { Rocks } from "./Rocks";
import { Portal } from "./Portal";
import { FloatingRocks } from "./FloatingRocks";
import { Trees } from "./Trees";
import { Words } from "./Words";
import { Grass } from "./Grass";
import { SceneParticles } from "./SceneParticles";

const lightColor = new THREE.Color(1, 0.2, 0.1);

interface CanvasSceneProps {
  isModernGPU: boolean;
  isLegacy: boolean;
}

export const CanvasScene = memo(function CanvasScene({ isModernGPU, isLegacy }: CanvasSceneProps) {
  return (
    <Suspense fallback={null}>
      {/* Если GPU старый — убираем HDR, ставим обычный сплошной цвет фона для разгрузки памяти */}
      {isLegacy ? (
        <color attach='background' args={["#14141a"]} />
      ) : (
        <>
          <Environment background={isModernGPU ? "only" : false} files='textures/bg.hdr' />
          <Environment background={false} files='textures/envmap.hdr' />
        </>
      )}

      {/* Обычный эмбиент-свет для WebGL1, чтобы сцена не была полностью черной без HDR карты */}
      {isLegacy && <ambientLight intensity={0.6} color='#7788aa' />}

      <Float speed={isLegacy ? 0 : 0.3} rotationIntensity={0.4} floatIntensity={0.4}>
        <spotLight
          penumbra={1}
          distance={100}
          angle={60.65 * (Math.PI / 180)}
          intensity={isLegacy ? 1.5 : 0.4} // Компенсируем отсутствие HDR повышенной яркостью
          color={lightColor}
          position={[1.19, 10.85, -4.45]}
        />

        {/* ГЛАВНОЕ ОТСЕЧЕНИЕ: Портал полностью вырезается на WebGL1 устройствах */}
        {!isLegacy && <Portal />}

        <Rocks />
        <FloatingIsland />
        <Trees />
        <Words />
        <Grass />
        <SceneParticles />
      </Float>

      <FloatingRocks />

      {/* Постобработка включается ТОЛЬКО на полноценном WebGL2 */}
      {isModernGPU && !isLegacy && (
        <EffectComposer stencilBuffer={true}>
          <DepthOfField target={[1.19, 10.85, -4.45]} focalLength={2.0} bokehScale={0.3} />
          <HueSaturation hue={0} saturation={-0.15} />
          <BrightnessContrast brightness={0.0} contrast={0.035} />
          <ChromaticAberration radialModulation={true} offset={new THREE.Vector2(0.0012, 0.0012)} />
        </EffectComposer>
      )}

      <PerspectiveCamera makeDefault fov={50} position={[-1.75, 10.85, 20.35]} />
      <OrbitControls
        target={new THREE.Vector3(1, 5, 0)}
        maxPolarAngle={Math.PI * 0.48}
        makeDefault
      />
    </Suspense>
  );
});
