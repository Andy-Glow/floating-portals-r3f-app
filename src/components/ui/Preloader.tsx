import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { fpsBenchmark } from "../../services/fpsBenchmark";

interface PreloaderProps {
  onComplete: (isLegacyMode: boolean) => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const { progress } = useProgress();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // ЖЕЛЕЗНЫЙ ФИЛЬТР: Проверяем физические лимиты кремниевого чипа до запуска теста кадров
    let isHardwareWeak = false;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        // Если лимит текстур 4K или меньше — это гарантированно старая или ультрабюджетная видеокарта
        if (maxTextureSize <= 4096) {
          isHardwareWeak = true;
        }
        // Безопасно освобождаем тестовый контекст
        const loseContextExt = gl.getExtension("WEBGL_lose_context");
        if (loseContextExt) loseContextExt.loseContext();
      }
    } catch {
      isHardwareWeak = true;
    }

    // Если видеокарта аппаратно старая, мы отменяем бенчмарк FPS, чтобы не насиловать GPU
    if (isHardwareWeak) {
      const checkLoadingAndResolveLegacy = () => {
        if (progress >= 100 && isMounted) {
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete(true); // Жестко принудительно включаем Legacy-режим
          }, 300);
        } else if (isMounted) {
          setTimeout(checkLoadingAndResolveLegacy, 100);
        }
      };
      checkLoadingAndResolveLegacy();
      return;
    }

    // ШТАТНЫЙ РЕЖИМ (Для средних и мощных систем): Запускаем фоновый замер FPS
    fpsBenchmark.startTest(1000).then((averageFps) => {
      if (!isMounted) return;

      const shouldTriggerLegacy = averageFps < 40;

      const checkLoadingAndResolve = () => {
        if (progress >= 100) {
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete(shouldTriggerLegacy);
          }, 300);
        } else {
          setTimeout(checkLoadingAndResolve, 100);
        }
      };

      checkLoadingAndResolve();
    });

    return () => {
      isMounted = false;
    };
  }, [progress, onComplete]);

  return (
    <div className={`preloader-overlay ${isFadingOut ? "fade-out" : ""}`}>
      <div className="loader-container">
        <h2 className="loader-title">LOADING DIMENSION</h2>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-text">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

