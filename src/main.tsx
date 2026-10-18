import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { applyWebGLPatch } from "./utils/webglPatch.ts"; // Импортируем хак совместимости для старых систем
import "./styles/main.scss";

// Активируем патч для поддержки старых видеокарт до инициализации React Three Fiber
applyWebGLPatch();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
