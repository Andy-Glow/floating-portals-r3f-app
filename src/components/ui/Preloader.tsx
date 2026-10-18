import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { fpsBenchmark } from "../../services/fpsBenchmark";

interface PreloaderProps {
  onComplete: (isLegacyMode: boolean) => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  // Реальный процент загрузки моделей и текстур из кэша Drei
  const { progress } = useProgress();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Запускаем фоновый замер производительности на 1 секунду (1000мс)
    fpsBenchmark.startTest(1000).then((averageFps) => {
      if (!isMounted) return;

      // Критерий слабого железа: если средний FPS ниже 40 кадров — выбираем Legacy-режим
      const shouldTriggerLegacy = averageFps < 40;

      // Функция ожидания, пока загрузка моделей Drei дойдет до 100%
      const checkLoadingAndResolve = () => {
        if (progress >= 100) {
          // Активируем CSS-класс плавного исчезновения
          setIsFadingOut(true);

          // Даем анимации угасания завершиться (300мс) и передаем результат в App.tsx
          setTimeout(() => {
            onComplete(shouldTriggerLegacy);
          }, 300);
        } else {
          // Если ассеты еще скачиваются, проверяем повторно через 100мс
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
    // Динамически добавляем класс 'fade-out', когда загрузка завершена
    <div className={`preloader-overlay ${isFadingOut ? "fade-out" : ""}`}>
      <div className='loader-container'>
        <h2 className='loader-title'>LOADING DIMENSION</h2>

        <div className='progress-track'>
          {/* Управляем шириной полосы напрямую через инлайн-стиль React */}
          <div className='progress-bar' style={{ width: `${progress}%` }} />
        </div>

        <p className='progress-text'>{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
