import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FillQuad } from "./FillQuad";

export function Portal() {
  const model = useGLTF("models/portal.glb");
  const mask = useGLTF("models/portal_mask.glb");
  const internalSceneRef = useRef<THREE.Scene>(null);

  const { size, viewport } = useThree();
  const isMobile = viewport.width < 6;

  // Оптимизация: на мобильных девайсах рендерим скрытую сцену в чуть меньшем разрешении
  const targetResolutionDivider = isMobile ? 1.5 : 1;

  const galaxyTexture = useTexture("textures/galaxy.jpg", (texture) => {
    if (!Array.isArray(texture)) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
    }
  });

  const target = useMemo(() => {
    return new THREE.WebGLRenderTarget(
      Math.floor(size.width / targetResolutionDivider),
      Math.floor(size.height / targetResolutionDivider),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        // ВОЗВРАЩАЕМ БУФЕРЫ: Без них stencil-маска полностью ломается
        depthBuffer: true,
        stencilBuffer: true,
      },
    );
  }, [size.width, size.height, targetResolutionDivider]);

  useEffect(() => {
    return () => target.dispose();
  }, [target]);

  // Рендерим скрытую сцену космоса каждый кадр для плавного параллакса
  useFrame((state) => {
    if (!internalSceneRef.current) return;
    state.gl.setRenderTarget(target);
    state.gl.render(internalSceneRef.current, state.camera);
    state.gl.setRenderTarget(null);
  });

  useEffect(() => {
    if (model) {
      model.scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          if (mesh.material && !Array.isArray(mesh.material)) {
            (mesh.material as THREE.MeshStandardMaterial).envMapIntensity = isMobile ? 1.5 : 3.5;
          }
        }
      });
    }

    if (mask) {
      mask.scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          object.renderOrder = 5;
          const mesh = object as THREE.Mesh;
          if (mesh.material && !Array.isArray(mesh.material)) {
            const material = mesh.material as THREE.MeshStandardMaterial;

            // ВОЗВРАЩАЕМ DoubleSide: Гарантирует корректную запись маски под любым углом обзора
            material.side = THREE.DoubleSide;
            material.transparent = false;
            material.depthWrite = true;

            material.stencilWrite = true;
            material.stencilRef = 1;
            material.stencilFunc = THREE.AlwaysStencilFunc;
            material.stencilZPass = THREE.ReplaceStencilOp;
          }
        }
      });
    }
  }, [model, mask, isMobile]);

  return (
    <>
      {/* Изолированная сцена «другого измерения» */}
      <scene ref={internalSceneRef} background={galaxyTexture} />
      {/* Сама рамка портала */}
      <primitive object={model.scene} />
      {/* Невидимая плоскость-заглушка, которая размечает пиксели в буфере трафарета */}
      <primitive object={mask.scene} />
      {/* Финальный шейдер, который выводит текстуру космоса строго внутри размеченной маски */}
      <FillQuad map={target.texture} maskId={1} />
    </>
  );
}

useGLTF.preload("models/portal.glb");
useGLTF.preload("models/portal_mask.glb");
