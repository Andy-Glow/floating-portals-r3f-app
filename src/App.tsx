import { Canvas } from "@react-three/fiber";
import { CanvasScene } from "./components/CanvasScene/CanvasScene";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      {/* Принудительно выделяем память под операции трафарета */}
      <Canvas gl={{ stencil: true }}>
        <CanvasScene />
      </Canvas>
    </div>
  );
}
