import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { CanvasScene } from "./components/scene/CanvasScene";

// Простая детекция мобильных устройств для оптимизации разрешения холста
const isMobileDevice =
  typeof navigator !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

export default function App() {
  const { progress } = useProgress();
  const [isLoading, setIsLoading] = useState(true);

  // Закрываем прелоадер строго тогда, когда 3D-модели полностью скачались на 100%
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div className='webgl-container'>
      {/* HTML-Экран загрузки (классический чистый компонент) */}
      {isLoading && (
        <div className={`preloader-overlay ${progress >= 100 ? "fade-out" : ""}`}>
          <div className='loader-container'>
            <h2 className='loader-title'>LOADING DIMENSION</h2>
            <div className='progress-track'>
              <div className='progress-bar' style={{ width: `${progress}%` }} />
            </div>
            <p className='progress-text'>{Math.round(progress)}%</p>
          </div>
        </div>
      )}

      {/* Единый глобальный 3D-холст WebGL */}
      <Canvas
        // МОБИЛЬНАЯ ОПТИМИЗАЦИЯ: На смартфонах фиксируем dpr на 1, снижая количество просчитываемых пикселей в 3 раза.
        // На мощных ПК разрешаем мягкое сглаживание до 1.5. Это удерживает 60 FPS на телефонах.
        dpr={isMobileDevice ? 1 : [1, 1.5]}
        gl={{
          stencil: true, // Жизненно необходим для маски 3D-портала
          antialias: !isMobileDevice, // Отключаем тяжелое MSAA сглаживание на смартфонах
          alpha: false,
          powerPreference: "high-performance", // Сразу просим систему задействовать дискретную видеокарту
        }}>
        <Suspense fallback={null}>
          <CanvasScene isMobile={isMobileDevice} />
        </Suspense>
      </Canvas>
    </div>
  );
}
