import { Suspense, useMemo, lazy } from "react";
import { Canvas } from "@react-three/fiber";

// ЛЕНИВАЯ ЗАГРУЗКА: Полностью изолирует тяжелую постобработку для Chrome
const CanvasScene = lazy(() =>
  import("./components/CanvasScene/CanvasScene").then((module) => ({
    default: module.CanvasScene,
  })),
);

export default function App() {
  // Проверяем поддержку WebGL 2.0 при старте приложения
  const isModernGPU = useMemo(() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
    } catch {
      return false;
    }
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
      <Canvas
        // Ограничиваем разрешение рендеринга на слабых системах и мобилках
        dpr={isModernGPU ? [1, 1.5] : 1}
        gl={{
          stencil: true,
          antialias: isModernGPU, // Выключаем тяжелое сглаживание на старом железе
          powerPreference: "high-performance",
        }}>
        <Suspense fallback={null}>
          {/* Передаем флаг железа внутрь сцены */}
          <CanvasScene isModernGPU={isModernGPU} />
        </Suspense>
      </Canvas>
    </div>
  );
}
