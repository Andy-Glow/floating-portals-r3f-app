import { Text3D, Float } from "@react-three/drei";

// Стандартные массивы-кортежи.
const FLOAT_POSITION: [number, number, number] = [2.5, 7.1, -3.0];
const FLOAT_ROTATION: [number, number, number] = [0, -0.4, -0.05];
const SECOND_LINE_POS: [number, number, number] = [0, -0.5, 0.1];

// Переводим цвета в строки — Three.js парсит их один раз при старте
const TEXT_COLOR = "#ff261a";
const EMISSIVE_COLOR = "#ff1a00";

export function Words() {
  const fontPath = "fonts/Roboto_Regular.json";

  return (
    <Float
      position={FLOAT_POSITION}
      rotation={FLOAT_ROTATION}
      rotationIntensity={0.35}
      floatIntensity={0.5}>
      <Text3D font={fontPath} size={0.25} height={0.065} curveSegments={6}>
        Welcome to the world of
        <meshStandardMaterial color={TEXT_COLOR} emissive={EMISSIVE_COLOR} />
      </Text3D>
      <Text3D
        position={SECOND_LINE_POS}
        font={fontPath}
        size={0.25}
        height={0.065}
        curveSegments={6}>
        exciting WebGL graphics
        <meshStandardMaterial color={TEXT_COLOR} emissive={EMISSIVE_COLOR} />
      </Text3D>
    </Float>
  );
}
