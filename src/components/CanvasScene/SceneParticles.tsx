import { Sparkles } from "@react-three/drei";

export function SceneParticles() {
  return (
    <>
      <Sparkles
        position={[3.5, 11.5, -5]}
        count={50}
        scale={[5, 3.5, 2]}
        color='#ffaacc'
        size={6}
        speed={0.2}
        noise={0.1}
        opacity={0.8} // Позволяет эффекту DepthOfField мягко размывать края частиц
      />

      <Sparkles
        position={[-1.5, 12, -5]}
        count={50}
        scale={[5, 3.5, 2.5]}
        color='#ffaacc'
        size={6}
        speed={0.2}
        noise={0.1}
        opacity={0.8} // Позволяет эффекту DepthOfField мягко размывать края частиц
      />

      <Sparkles
        position={[1, 8, -4]}
        count={50}
        scale={[5, 3.5, 2.5]}
        color='#ffaacc'
        size={6}
        speed={0.2}
        noise={0.1}
        opacity={0.8} // Позволяет эффекту DepthOfField мягко размывать края частиц
      />

      <Sparkles
        position={[0, 6, 0]}
        count={50}
        scale={[12, 2, 12]}
        color='#ffe6a8'
        size={10} // Крупные частицы на переднем плане превратятся в сочные диски боке!
        speed={0.2}
        noise={0.2}
        opacity={0.8}
      />

      <Sparkles
        position={[-5, 9, -5]}
        count={50}
        scale={[4, 4, 4]}
        color='#ffe6a8'
        size={6}
        speed={0.2}
        noise={0.2}
        opacity={0.8}
      />

      <Sparkles
        position={[5.5, 9, -8]}
        count={50}
        scale={[5, 5, 5]}
        color='#ffe6a8'
        size={6}
        speed={0.2}
        noise={0.2}
        opacity={0.8}
      />
    </>
  );
}
