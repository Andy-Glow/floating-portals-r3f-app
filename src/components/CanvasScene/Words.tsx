// Оптимизированный src/components/CanvasScene/Words.tsx
import { Text3D, Float } from "@react-three/drei";

export function Words() {
  const fontPath = "fonts/Roboto_Regular.json";

  return (
    // Один Float на весь текстовый блок вместо раздельных
    <Float
      position={[2.5, 7.1, -3.0]}
      rotation={[0, -0.4, -0.05]}
      rotationIntensity={0.35}
      floatIntensity={0.5}>
      <Text3D font={fontPath} size={0.25} height={0.065} curveSegments={6}>
        {" "}
        {/* Снизили сегменты с 12 до 6 */}
        Welcome to the world of
        <meshStandardMaterial color={[1, 0.15, 0.1]} emissive={[1, 0.1, 0]} />
      </Text3D>

      {/* Смещаем вторую строчку локально вниз */}
      <Text3D
        position={[0, -0.5, 0.1]}
        font={fontPath}
        size={0.25}
        height={0.065}
        curveSegments={6}>
        exciting WebGL graphics
        <meshStandardMaterial color={[1, 0.15, 0.1]} emissive={[1, 0.1, 0]} />
      </Text3D>
    </Float>
  );
}
