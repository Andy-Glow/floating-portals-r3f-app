interface GpuStatus {
  webgl2: boolean;
  isLegacy: boolean;
}

/**
 * Модуль универсального аппаратного аудита видеокарты (по лимитам WebGL).
 * Выполняется один раз при загрузке скрипта, изолируя сайд-эффекты от React.
 */
const checkHardwareCapabilities = (): GpuStatus => {
  try {
    // Безопасная проверка на среду выполнения (исключаем сбои при SSR)
    if (typeof window === "undefined" || typeof document === "undefined") {
      return { webgl2: false, isLegacy: true };
    }

    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    const isWebGL2 = !!(window.WebGL2RenderingContext && gl2);

    if (!gl2) {
      return { webgl2: false, isLegacy: true };
    }

    // Запрашиваем физический лимит разрешения текстур кремниевого чипа
    const maxTextureSize = gl2.getParameter(gl2.MAX_TEXTURE_SIZE);

    // Считываем имя рендерера для обнаружения медленной программной эмуляции
    const debugInfo = gl2.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo ? gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "";
    const isSoftware =
      renderer.toLowerCase().includes("swiftshader") || renderer.toLowerCase().includes("llvmpipe");

    // Защита памяти старых ПК: принудительно уничтожаем временный контекст
    const loseContextExt = gl2.getExtension("WEBGL_lose_context");
    if (loseContextExt) {
      loseContextExt.loseContext();
    }

    // Критерий слабого железа: лимит текстур 4K или ниже, либо софтверный рендер
    const isWeakHardware = maxTextureSize <= 4096 || isSoftware;

    return {
      webgl2: isWebGL2 && !isWeakHardware,
      // Мобильные устройства и старое железо по умолчанию получают безопасный движок
      isLegacy: !isWebGL2 || isWeakHardware || navigator.userAgent.includes("Mobile"),
    };
  } catch {
    // Экстренный фоллбэк при блокировке WebGL в браузере
    return { webgl2: false, isLegacy: true };
  }
};

// Экспортируем константу с уже готовым результатом тестирования железа
export const GPU_STATUS = checkHardwareCapabilities();
