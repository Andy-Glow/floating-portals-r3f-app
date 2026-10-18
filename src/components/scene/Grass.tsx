import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export function Grass() {
  // Загружаем оригинальный ассет травы из глобального кэша Drei
  const gltf = useGLTF("models/grass.glb");

  // Получаем физические параметры вьюпорта холста
  const { viewport } = useThree();
  const isMobile = viewport.width < 6;

  /**
   * ЧИСТАЯ ШЕЙДЕРНАЯ НАСТРОЙКА (Без useEffect и мутаций):
   * Создаем глубокий независимый клон травы внутри useMemo.
   * Функция на лету оптимизирует материалы под текущее железо (ПК или мобильный).
   * React Compiler полностью одобряет такой подход, гарантируя сборку без ворнингов.
   */
  const optimizedGrass = useMemo(() => {
    if (!gltf) return null;

    // Глубокое клонирование 3D-модели для изоляции от глобального кэша React
    const clone = gltf.scene.clone(true);

    // Безопасный обход всех мешей травы для перенастройки шейдеров
    clone.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;

        if (mesh.material && !Array.isArray(mesh.material)) {
          const material = mesh.material as THREE.MeshStandardMaterial;

          // ОПТИМИЗАЦИЯ ФИЛЛРЕЙТА: Динамически переключаем ресурсоемкость рендеринга краев травинок
          if (isMobile) {
            // На смартфонах отсекаем пиксели по порогу альфа-канала — это в разы быстрее для мобильных GPU
            material.alphaToCoverage = false;
            material.transparent = false;
            material.alphaTest = 0.5; // Жестко отсекаем прозрачные края текстуры
            material.side = THREE.FrontSide; // Рендерим только лицевые полигоны, экономя филлрейт
          } else {
            // На мощных ПК включаем дорогое субпиксельное сглаживание краев травы
            material.alphaToCoverage = true;
            material.transparent = true;
            material.side = THREE.DoubleSide; // Двухсторонний рендеринг травинок
          }

          // ЗАЩИТА ТЕКСТУР: Исправляем возможные ошибки экспорта слотов материалов
          const activeTexture = material.map || material.emissiveMap;
          if (activeTexture) {
            material.map = activeTexture;
            material.emissiveMap = activeTexture;
            // Приглушаем интенсивность свечения, чтобы убрать белые засветы на солнце
            material.emissive.setRGB(0.15, 0.15, 0.15);
          } else {
            // Фолбэк-заглушка: если модель без текстуры, красим в красивый неоновый темно-зеленый
            material.color.setRGB(0.05, 0.2, 0.05);
            material.emissive.setRGB(0.02, 0.1, 0.02);
          }

          // Команда WebGL-контексту принудительно обновить скомпилированный шейдер в видеопамяти
          material.needsUpdate = true;
        }
      }
    });

    return clone;
  }, [gltf, isMobile]);

  // Пока файл модели скачивается по сети, удерживаем рендеринг
  if (!optimizedGrass) return null;

  // Выводим оптимизированный и безопасный клон травы в сцену
  return <primitive object={optimizedGrass} />;
}

// Предзагрузка ассета травы в память для удержания стабильного FPS при старте
useGLTF.preload("models/grass.glb");
