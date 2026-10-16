import { Text3D, Float } from "@react-three/drei";

export function Words() {
  const fontPath = "fonts/Roboto_Regular.json";

  return (
    <>
      {/* Первая строчка. Добавили покачивание */}
      <Float
        position={[2.5, 7.1, -3.0]}
        rotation={[0, -0.4, -0.05]}
        rotationIntensity={0.35} // Интенсивность покачивания осей
        floatIntensity={0.5} // Сила движения вверх-вниз
      >
        <Text3D font={fontPath} size={0.25} height={0.065} curveSegments={12}>
          Welcome to the world of
          <meshStandardMaterial color={[1, 0.15, 0.1]} emissive={[1, 0.1, 0]} />
        </Text3D>
      </Float>

      {/* Вторая строчка — аналогично оборачиваем во Float */}
      <Float
        position={[2.5, 6.6, -2.9]}
        rotation={[0, -0.4, -0.05]}
        rotationIntensity={0.35}
        floatIntensity={0.5}>
        <Text3D font={fontPath} size={0.25} height={0.065} curveSegments={12}>
          exciting WebGL graphics
          <meshStandardMaterial color={[1, 0.15, 0.1]} emissive={[1, 0.1, 0]} />
        </Text3D>
      </Float>
    </>
  );
}
