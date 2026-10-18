import { useGLTF, Float } from "@react-three/drei";

// Статические координаты позиций, вынесенные наружу для экономии памяти
const POS_ROCK1: [number, number, number] = [5, 15, -33];
const POS_ROCK2: [number, number, number] = [-20, 5, -15];
const POS_ROCK3: [number, number, number] = [20, 3.5, -9];

export function FloatingRocks() {
  // Загружаем модели напрямую из кэша Drei
  const rock1 = useGLTF("models/floating_rock_1.glb");
  const rock2 = useGLTF("models/floating_rock_2.glb");
  const rock3 = useGLTF("models/floating_rock_3.glb");

  return (
    <>
      {/* Камень 2: Интенсивное вращение, средняя скорость парения */}
      <Float speed={1.5} rotationIntensity={1.6} floatIntensity={0.5}>
        <primitive object={rock2.scene.clone()} position={POS_ROCK2} />
      </Float>

      {/* Камень 1: Дублирует настройки второго для баланса на заднем плане */}
      <Float speed={1.5} rotationIntensity={1.6} floatIntensity={0.5}>
        <primitive object={rock1.scene.clone()} position={POS_ROCK1} />
      </Float>

      {/* Камень 3: Вращается чуть медленнее, создавая хаотичность движения */}
      <Float speed={1.2} rotationIntensity={1.1} floatIntensity={0.3}>
        <primitive object={rock3.scene.clone()} position={POS_ROCK3} />
      </Float>
    </>
  );
}

// Предзагрузка ассетов в память для удержания стабильного FPS при старте
useGLTF.preload("models/floating_rock_1.glb");
useGLTF.preload("models/floating_rock_2.glb");
useGLTF.preload("models/floating_rock_3.glb");
