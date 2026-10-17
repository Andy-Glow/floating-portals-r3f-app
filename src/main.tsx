// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/main.scss";

// ЖЕЛЕЗНЫЙ ХАК ДЛЯ СТАРЫХ GPU AMD/INTEL:
// Перехватываем создание WebGL контекста и подменяем функцию проверки шейдеров.
// Если драйвер возвращает ошибку валидации с ПУСТЫМ логом — мы принудительно говорим Three.js, что всё отлично.
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  type: string,
  attributes?: any,
) {
  const gl = originalGetContext.call(this, type, attributes) as
    | WebGLRenderingContext
    | WebGL2RenderingContext
    | null;

  if (gl && (type === "webgl" || type === "webgl2")) {
    const originalGetProgramParameter = gl.getProgramParameter;
    gl.getProgramParameter = function (program: WebGLProgram, pname: GLenum) {
      // Если Three.js запрашивает VALIDATE_STATUS
      if (pname === gl.VALIDATE_STATUS) {
        const status = originalGetProgramParameter.call(this, program, pname);
        if (!status) {
          const infoLog = gl.getProgramInfoLog(program);
          // Если статус false, но лог ошибки пустой — это баг старого драйвера! Игнорируем его.
          if (!infoLog || infoLog.trim() === "") {
            return true;
          }
        }
      }
      return originalGetProgramParameter.call(this, program, pname);
    };
  }
  return gl;
} as any;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
