import {
  EffectComposer,
  DepthOfField,
  HueSaturation,
  BrightnessContrast,
  ChromaticAberration,
} from "@react-three/postprocessing";
import * as THREE from "three";

// Фиксируем векторы настроек, чтобы не нагружать Garbage Collector
const CHROMATIC_OFFSET = new THREE.Vector2(0.00175, 0.00175);
const DOF_TARGET: [number, number, number] = [1.19, 10.85, -4.45];

export function PostProcessingEffects() {
  return (
    <EffectComposer stencilBuffer={true}>
      {/* Размытие заднего плана (Боке) */}
      <DepthOfField
        target={DOF_TARGET}
        focalLength={1.5}
        bokehScale={0.5}
      />
      {/* Цветокоррекция гаммы сцены */}
      <HueSaturation hue={0} saturation={-0.15} />
      <BrightnessContrast brightness={0.0} contrast={0.035} />
      {/* Эффект искажения линзы */}
      <ChromaticAberration
        radialModulation={true}
        offset={CHROMATIC_OFFSET}
      />
    </EffectComposer>
  );
}
