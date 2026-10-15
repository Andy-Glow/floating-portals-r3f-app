import { Canvas } from "@react-three/fiber";
import { CanvasScene } from "./components/CanvasScene/CanvasScene";

export default function App() {
  return (
    <>
      {/* СЛОЙ 2D: Сюда позже встанут HTML-оверлеи */}
      <main className="interface-layer">{/* Пока пусто */}</main>

      {/* СЛОЙ 3D: Canvas изолирован */}
      <div className="webgl-container">
        <Canvas
          camera={{
            position: [10, 10, 10],
            fov: 45,
          }}
        >
          <CanvasScene />
        </Canvas>
      </div>
    </>
  );
}
