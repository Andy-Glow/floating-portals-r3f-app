import { Suspense, lazy, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Preloader } from "./components/ui/Preloader";

// ДИНАМИЧЕСКИЙ РАЗДЕЛ БАНДЛА (Lazy Loading):
// Тяжелый пак постобработки ModernScene изолирован в отдельном чанке и не скачивается на слабых ПК.
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

export default function App() {
  // Состояние отображения экрана прелоадера (по умолчанию включен при старте)
  const [isLoading, setIsLoading] = useState(true);

  // Управляющий флаг выбора графического движка (false = Modern, true = Legacy)
  const [isLegacyMode, setIsLegacyMode] = useState(false);

  /**
   * КОЛБЭК ОКОНЧАНИЯ ТЕСТИРОВАНИЯ И ЗАГРУЗКИ:
   * Вызывается компонентом Preloader, когда модели скачаны до 100%,
   * а бенчмарк FPS выдал точный вердикт о производительности системы.
   */
  const handleLoadingComplete = (triggeredLegacy: boolean) => {
    setIsLegacyMode(triggeredLegacy); // Фиксируем графический режим
    setIsLoading(false); // Плавно демонтируем прелоадер с экрана
  };

  return (
    // Класс .webgl-container из main.scss фиксирует холст по границам экрана
    <div className='webgl-container'>
      {/* Показываем прелоадер поверх холста, пока идет загрузка ассетов и замер FPS */}
      {isLoading && <Preloader onComplete={handleLoadingComplete} />}

      {/* Глобальный WebGL холст инициализируется с адаптивными параметрами под выбранный режим */}
      <Canvas
        // На слабом железе фиксируем dpr на 1, спасая филлрейт видеокарты в 3 раза
        dpr={isLegacyMode ? 1 : [1, 1.5]}
        gl={{
          stencil: !isLegacyMode, // Стенсил-буфер включается только для 3D-эффекта купола Modern-арки
          antialias: !isLegacyMode, // Отключаем ресурсоемкое сглаживание MSAA на слабом железе
          alpha: false,
          powerPreference: "default", // Предотвращает краш Chromium на ноутбуках со сдвоенной графикой
          failIfMajorPerformanceCaveat: false, // Запрещаем Three.js блокировать запуск на медленных GPU
        }}>
        {/* Suspense удерживает поток отрисовки, пока чанки кода сцен монтируются в граф Three.js */}
        <Suspense fallback={null}>
          {isLegacyMode ? <LegacyScene /> : <ModernScene isModernGPU={true} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
