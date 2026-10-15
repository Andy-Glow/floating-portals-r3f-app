import { useGLTF, Float } from "@react-three/drei";

export function FloatingRocks() {
  const rock1 = useGLTF("models/floating_rock_1.glb");
  const rock2 = useGLTF("models/floating_rock_2.glb");
  const rock3 = useGLTF("models/floating_rock_3.glb");

  return (
    <>
      {/* Второй камень: скорость 1.5, покачивание по осям вращения 1.6, без движения вверх-вниз */}
      <Float speed={1.5} rotationIntensity={1.6} floatIntensity={0}>
        <primitive object={rock2.scene} position={[-20.5, -7, -19]} />
      </Float>

      {/* Первый камень: дублирует настройки второго */}
      <Float speed={1.5} rotationIntensity={1.6} floatIntensity={0}>
        <primitive object={rock1.scene} position={[-5, 10, -33]} />
      </Float>

      {/* Третий камень: вращается чуть медленнее (интенсивность 1.1) */}
      <Float speed={1.5} rotationIntensity={1.1} floatIntensity={0}>
        <primitive object={rock3.scene} position={[20, 3.5, -9]} />
      </Float>
    </>
  );
}

useGLTF.preload("models/floating_rock_1.glb");
useGLTF.preload("models/floating_rock_2.glb");
useGLTF.preload("models/floating_rock_3.glb");
