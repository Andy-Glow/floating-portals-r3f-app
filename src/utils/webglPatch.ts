/**
 * Низкоуровневый патч WebGL для старых систем (тестировалось на AMD Radeon HD 7xxxM / Intel HD 4000).
 * Исправляет баг ложного статуса VALIDATE_STATUS при пустом infoLog, предотвращая белый экран.
 */
export function applyWebGLPatch(): void {
  // ПРОВЕРКА ОКРУЖЕНИЯ: Если код запускается во время серверного рендеринга (SSR) или в среде без DOM, экстренно выходим
  if (typeof window === "undefined" || !HTMLCanvasElement.prototype.getContext) return;

  // СОХРАНЕНИЕ ОРИГИНАЛА: Запоминаем исходный метод браузера, чтобы вызывать его внутри нашей обертки
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  // ПЕРЕХВАТ МЕТОДА: Переопределяем getContext для всех canvas-элементов в приложении
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    type: string,
    attributes?: WebGLContextAttributes,
  ): RenderingContext | null {
    // Вызываем родной браузерный метод для создания базового графического контекста
    const gl = originalGetContext.call(this, type, attributes);

    // БЕЗОПАСНОЕ ПРИВЕДЕНИЕ ТИПОВ: Локально кастуем контекст к WebGL, чтобы TypeScript разрешил работу с 3D-командами
    const webgl = gl as WebGLRenderingContext | WebGL2RenderingContext | null;

    // ИНЪЕКЦИЯ В 3D: Если браузер успешно инициализировал сцену WebGL 1.0 или WebGL 2.0
    if (webgl && (type === "webgl" || type === "webgl2")) {
      // Запоминаем оригинальный метод проверки параметров скомпилированных шейдеров
      const originalGetProgramParameter = webgl.getProgramParameter;

      // МОДИФИКАЦИЯ КОМАНДЫ: Переписываем логику опроса видеокарты о состоянии её шейдерных программ
      webgl.getProgramParameter = function (program: WebGLProgram, pname: GLenum) {
        // Перехватываем событие, когда движок (Three.js) запрашивает статус валидации (VALIDATE_STATUS)
        if (pname === webgl.VALIDATE_STATUS) {
          // Вызываем реальную проверку видеокарты и получаем её ответ (true или false)
          const status = originalGetProgramParameter.call(this, program, pname);

          // КРИТИЧЕСКИЙ ФИКС: Если видеокарта рапортует о ложной ошибке компиляции (status === false)
          if (!status) {
            // Запрашиваем у видеокарты текстовый лог ошибок компиляции текущего шейдера
            const infoLog = webgl.getProgramInfoLog(program);

            // АНАЛИЗ БАГА: Если статус ложный, но текстовый лог при этом пустой — это аппаратный баг старого драйвера!
            if (!infoLog || infoLog.trim() === "") {
              return true; // Принудительно обманываем Three.js и возвращаем true, заставляя рендерить объект
            }
          }
        }

        // Во всех остальных штатных ситуациях возвращаем стандартный ответ видеокарты
        return originalGetProgramParameter.call(this, program, pname);
      };
    }

    // Возвращаем инициализированный и модифицированный графический контекст обратно на холст
    return gl;
  } as typeof HTMLCanvasElement.prototype.getContext; // Жестко связываем типы нашей обертки с сигнатурой прототипа браузера
}
