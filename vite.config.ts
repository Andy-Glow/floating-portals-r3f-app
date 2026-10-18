import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  // Указываем имя вашего репозитория в качестве базового пути.
  // Это гарантирует, что после деплоя все 3D-модели .glb и .hdr текстуры успешно загрузятся в браузер.
  base: "/floating-portals-r3f-app/",
});
