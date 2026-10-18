import { useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Хук для динамического мониторинга производительности сцены.
 * Считает реальный FPS устройства в процессе рендеринга.
 */
export function usePerformanceMonitor(lowFpsThreshold = 35, testDurationMs = 2500) {
  const [isLegacyRequired, setIsLegacyMode] = useState(false);
  
  // Локальный кэш для фиксации кадров без провоцирования лишних рендеров React
  const stats = useMemo(() => ({
    frameCount: 0,
    startTime: performance.now(),
    isCompleted: false
  }), []);

  useFrame(() => {
    if (stats.isCompleted || isLegacyRequired) return;

    stats.frameCount++;
    const currentTime = performance.now();
    const elapsedTime = currentTime - stats.startTime;

    // Каждые 500 миллисекунд проверяем накопленный FPS
    if (elapsedTime >= 500) {
      const currentFps = (stats.frameCount * 1000) / elapsedTime;

      // Если производительность упала ниже критического порога — экстренно включаем Legacy
      if (currentFps < lowFpsThreshold) {
        stats.isCompleted = true;
        setIsLegacyMode(true);
        return;
      }

      stats.frameCount = 0;
      stats.startTime = currentTime;
    }
  });

  useEffect(() => {
    // Если за 2.5 секунды FPS остался стабильным — фиксируем прохождение теста
    const timer = setTimeout(() => {
      stats.isCompleted = true;
    }, testDurationMs);

    return () => clearTimeout(timer);
  }, [testDurationMs, stats]);

  return isLegacyRequired;
}
