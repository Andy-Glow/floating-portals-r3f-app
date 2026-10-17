import { useEffect, useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

export function LegacyPortal() {
  const model = useGLTF("models/portal.glb");

  // Загружаем текстуру космоса
  const legacyGalaxy = useTexture("textures/legacy-galaxy.jpg", (texture) => {
    if (!Array.isArray(texture)) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    }
  });

  useEffect(() => {
    if (model) {
      model.scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          if (mesh.material && !Array.isArray(mesh.material)) {
            const mat = mesh.material as THREE.MeshStandardMaterial;

            mat.roughness = 0.6;
            mat.metalness = 0.1;

            // СДЕЛАЛИ РАМКУ ЯРЧЕ: Увеличили интенсивность самосвечения
            // Задали теплый багровый оттенок, чтобы проявить рельеф камня в тени
            mat.emissive = new THREE.Color(0.12, 0.05, 0.08);
            mat.emissiveIntensity = 2.5;

            mat.needsUpdate = true;
          }
        }
      });
    }
  }, [model]);

  // Шейдер для космоса с изменением цвета и яркости
  const customArcMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: legacyGalaxy },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D map;
        void main() {
          vec4 texColor = texture2D(map, vUv);
          
          // Математическое скругление верха под купол арки
          float alpha = 1.0;
          if (vUv.y > 0.52) {
            float dx = abs(vUv.x - 0.5);
            float normalizedY = (vUv.y - 0.52) / 0.48;
            if (dx > sqrt(1.0 - normalizedY * normalizedY) * 0.5) {
              alpha = 0.0;
            }
          }
          if (alpha < 0.1) discard;

          // ЦВЕТОКОРРЕКЦИЯ КОСМОСА:
          vec3 finalColor = texColor.rgb;
          
          // 1. Сдвигаем цвет в сторону красного (усиливаем красный канал, немного приглушаем зеленый)
          finalColor.r *= 1.3;
          finalColor.g *= 0.8;
          
          // 2. Делаем картинку космоса сочнее и ярче в 1.8 раза
          finalColor *= 1.8;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: true,
    });
  }, [legacyGalaxy]);

  return (
    <group>
      <primitive object={model.scene} />

      <mesh
        position={[1.1, 8.5, -4.1]}
        rotation={[0, 0, 0]}
        scale={[2.8, 4.4, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <primitive object={customArcMaterial} attach="material" />
      </mesh>
    </group>
  );
}

useGLTF.preload("models/portal.glb");
