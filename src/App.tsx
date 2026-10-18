import { Suspense, lazy, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { usePerformanceMonitor } from "./hooks/usePerformanceMonitor";

const ModernScene = lazy(() =>
  import("./components/scene/CanvasScene").then((module) => ({
    default: module.CanvasScene,
  })),
);

const LegacyScene = lazy(() =>
  import("./components/scene/LegacyScene").then((module) => ({
    default: module.LegacyScene,
  })),
);

// Локальный контроллер внутри контекста Canvas
function SceneController({ onDropToLegacy }: { onDropToLegacy: () => void }) {
  // Мониторим живой FPS в процессе отрисовки
  const shouldDrop = usePerformanceMonitor(35, 2500);

  useEffect(() => {
    if (shouldDrop) {
      onDropToLegacy();
    }
  }, [shouldDrop, onDropToLegacy]);

  return null;
}

export default function App() {
  const { progress } = useProgress();
  const [isLoading, setIsLoading] = useState(true);
  const [isLegacyMode, setIsLegacyMode] = useState(false);

  // Ждем, пока ассеты Drei загрузятся из сети на 100%
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div className="webgl-container">
      {/* HTML-прелоадер */}
      {isLoading && (
        <div className={`preloader-overlay ${progress >= 100 ? "fade-out" : ""}`}>
          <div className="loader-container">
            <h2 className="loader-title">LOADING DIMENSION</h2>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-text">{Math.round(progress)}%</p>
          </div>
        </div>
      )}

      <Canvas
        dpr={isLegacyMode ? 1 : [1, 1.5]}
        gl={{
          stencil: true, // Включаем буфер для первичного тестового прохода ModernScene
          antialias: !isLegacyMode,
          alpha: false,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
      >
        {/* Инжектируем контроллер живого FPS внутрь WebGL-контекста */}
        <SceneController onDropToLegacy={() => setIsLegacyMode(true)} />

        <Suspense fallback={null}>
          {isLegacyMode ? (
            <LegacyScene />
          ) : (
            <ModernScene isModernGPU={true} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}



