import { useGLTF } from "@react-three/drei";

export function Rocks() {
  const gltf = useGLTF("models/rocks.glb");

  return <primitive object={gltf.scene} />;
}

// Предзагрузка ассета в память для стабильного FPS
useGLTF.preload("models/rocks.glb");
