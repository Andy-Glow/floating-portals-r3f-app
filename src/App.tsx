import { Suspense, useMemo, lazy } from "react";
import { Canvas } from "@react-three/fiber";

const CanvasScene = lazy(() =>
  import("./components/CanvasScene/CanvasScene").then((module) => ({
    default: module.CanvasScene,
  })),
);

export default function App() {
  const gpuStatus = useMemo(() => {
    try {
      const canvas = document.createElement("canvas");
      const isWebGL2 = !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
      const isWebGL1 = !!(window.WebGLRenderingContext && canvas.getContext("webgl"));

      return {
        webgl2: isWebGL2,
        supported: isWebGL2 || isWebGL1,
        // Если это старый ноут, помечаем его как "экстремально слабый"
        isLegacy: !isWebGL2 && isWebGL1,
      };
    } catch {
      return { webgl2: false, supported: false, isLegacy: true };
    }
  }, []);

  // Если WebGL вообще не поддерживается браузером
  if (!gpuStatus.supported) {
    return (
      <div
        style={{
          color: "#fff",
          padding: 20,
          textAlign: "center",
          background: "#111",
          height: "100vh",
        }}>
        <h3>Ваш браузер или видеокарта не поддерживают WebGL рендеринг.</h3>
        <p>Пожалуйста, обновите драйверы видеокарты или используйте современный браузер.</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111", overflow: "hidden" }}>
      <Canvas
        // На старых GPU жестко режем dpr до 0.75-1.0 (сильный прирост FPS на HD7600m)
        dpr={gpuStatus.isLegacy ? 0.75 : [1, 1.5]}
        gl={{
          // На legacy-системах отключаем stencil, чтобы предотвратить белый экран в Chromium
          stencil: !gpuStatus.isLegacy,
          antialias: gpuStatus.webgl2,
          alpha: false,
          powerPreference: "high-performance",
          // Включаем совместимость с WebGL1, если WebGL2 заблокирован в Chrome
          failIfMajorPerformanceCaveat: false,
        }}>
        <Suspense fallback={null}>
          <CanvasScene isModernGPU={gpuStatus.webgl2} isLegacy={gpuStatus.isLegacy} />
        </Suspense>
      </Canvas>
    </div>
  );
}
