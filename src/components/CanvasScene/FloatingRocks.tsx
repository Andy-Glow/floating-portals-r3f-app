// Оптимизированный src/components/CanvasScene/FloatingRocks.tsx
import { useGLTF, Float } from "@react-three/drei";

export function FloatingRocks() {
  const rock1 = useGLTF("models/floating_rock_1.glb");
  const rock2 = useGLTF("models/floating_rock_2.glb");
  const rock3 = useGLTF("models/floating_rock_3.glb");

  return (
    // Объединяем все камни в единый анимационный цикл, экономя такты CPU
    <Float speed={1.2} rotationIntensity={1.4} floatIntensity={0}>
      <primitive object={rock2.scene} position={[-20.5, -7, -19]} />
      <primitive object={rock1.scene} position={[-5, 10, -33]} />
      <primitive object={rock3.scene} position={[20, 3.5, -9]} />
    </Float>
  );
}

useGLTF.preload("models/floating_rock_1.glb");
useGLTF.preload("models/floating_rock_2.glb");
useGLTF.preload("models/floating_rock_3.glb");
