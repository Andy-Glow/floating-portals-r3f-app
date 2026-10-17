import { Suspense, useMemo, lazy } from "react";
import { Canvas } from "@react-three/fiber";

const ModernScene = lazy(() =>
  import("./components/CanvasScene/CanvasScene").then((module) => ({
    default: module.CanvasScene,
  })),
);

const LegacyScene = lazy(() =>
  import("./components/CanvasScene/LegacyScene").then((module) => ({
    default: module.LegacyScene,
  })),
);

export default function App() {
  const gpuStatus = useMemo(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl2 = canvas.getContext("webgl2");
      const isWebGL2 = !!(window.WebGL2RenderingContext && gl2);

      const debugInfo = gl2
        ? gl2.getExtension("WEBGL_debug_renderer_info")
        : null;
      const renderer = debugInfo
        ? gl2!.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "";

      const isOldGPU =
        renderer.includes("7600") ||
        renderer.includes("HD Graphics 4000") ||
        renderer.includes("Intel");

      return {
        webgl2: isWebGL2 && !isOldGPU,
        isLegacy:
          !isWebGL2 || isOldGPU || navigator.userAgent.includes("Mobile"),
      };
    } catch {
      return { webgl2: false, isLegacy: true };
    }
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
        overflow: "hidden",
      }}
    >
      <Canvas
        dpr={gpuStatus.isLegacy ? 1 : [1, 1.5]}
        gl={{
          stencil: !gpuStatus.isLegacy, // Включаем обратно для работы портала, если вдруг запустится ModernScene
          antialias: !gpuStatus.isLegacy,
          alpha: false,
          powerPreference: "default", // Предотвращает вылеты переключаемой графики AMD Enduro
          failIfMajorPerformanceCaveat: false, // КРИТИЧЕСКИ: не падать при предупреждениях производительности
        }}
      >
        <Suspense fallback={null}>
          {gpuStatus.isLegacy ? (
            <LegacyScene />
          ) : (
            <ModernScene isModernGPU={gpuStatus.webgl2} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
