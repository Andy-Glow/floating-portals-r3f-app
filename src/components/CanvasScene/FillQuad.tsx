import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface FillQuadProps {
  map: THREE.Texture;
  maskId: number;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D map;
  void main() {
    vec3 col = texture2D(map, vUv).xyz;
    // Наша проверенная сочная контрастность и высокая яркость кадра
    gl_FragColor = vec4(pow(col, vec3(1.2)) * 2.5, 1.0);
  }
`;

export function FillQuad({ map, maskId }: FillQuadProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      map: { value: map },
    }),
    [map],
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.map.value = map;
    }
  }, [map]);

  const materialProperties = useMemo(
    () => ({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
      stencilWrite: true,
      stencilRef: maskId,
      stencilFunc: THREE.EqualStencilFunc, // Рисовать только внутри маски портала
    }),
    [uniforms, maskId],
  );

  return (
    // КРИТИЧЕСКИЙ ФИКС ОЧЕРЕДИ: Задаем renderOrder={10}, чтобы космос
    // накладывался в самый последний момент поверх готового буфера трафарета
    <mesh renderOrder={10}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial ref={materialRef} {...materialProperties} />
    </mesh>
  );
}
