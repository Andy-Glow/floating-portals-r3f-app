import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface FillQuadProps {
  map: THREE.Texture; // Текстура буфера рендеринга космоса
  maskId: number; // ID маски в stencil-буфере
}

// ВЕРШИННЫЙ ШЕЙДЕР: Растягивает плоскость на весь экран
const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// ФРАГМЕНТНЫЙ ШЕЙДЕР: Цветокоррекция и контрастность космоса
const FRAGMENT_SHADER = `
  varying vec2 vUv;
  uniform sampler2D map;
  void main() {
    vec3 col = texture2D(map, vUv).xyz;
    gl_FragColor = vec4(pow(col, vec3(1.2)) * 2.5, 1.0);
  }
`;

// ОПТИМИЗАЦИЯ: Выносим фиксированные аргументы геометрии во внешнюю константу
const PLANE_ARGS: [number, number, number, number] = [2, 2, 1, 1];

export function FillQuad({ map, maskId }: FillQuadProps) {
  // Реф для прямого доступа к материалу в обход циклов рендеринга React
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Мемоизация юниформов для фрагментного шейдера
  const uniforms = useMemo(
    () => ({
      map: { value: map },
    }),
    [map],
  );

  // Прямое обновление текстуры в видеопамяти при изменении кадра рендер-таргета
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.map.value = map;
    }
  }, [map]);

  return (
    <mesh renderOrder={10}>
      {/* Двухмерная полноэкранная плоскость-подложка */}
      <planeGeometry args={PLANE_ARGS} />

      {/* Низкоуровневый шейдерный материал с фильтрацией пикселей по трафарету */}
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        depthWrite={false} // Запрещаем перекрывать Z-индекс объектов переднего плана
        stencilWrite={true} // Активируем трафаретный буфер кадра
        stencilRef={maskId} // Привязываем проверку к идентификатору маски
        stencilFunc={THREE.EqualStencilFunc} // Отрисовка только на пикселях со значением maskId
      />
    </mesh>
  );
}
