import { useGLTF } from "@react-three/drei";

export function Rocks() {
  // Асинхронно загружаем 3D-модель статичных камней острова из глобального кэша Drei
  const gltf = useGLTF("models/rocks.glb");

  // Если файл модели еще скачивается по сети, прерываем рендеринг во избежание ошибок
  if (!gltf) return null;

  /* ЛАКОНИЧНЫЙ КЛОН ДЛЯ REACT COMPILER:
        Метод .clone() создает быструю изолированную копию трехмерных объектов скал.
        Это защищает глобальный кэш Drei от непредвиденных мутаций матриц и материалов,
        не загромождая код компонента лишними хуками useMemo и useEffect. */
  return <primitive object={gltf.scene.clone()} />;
}

// Хак R3F для предзагрузки ассета в память, чтобы сцена не заикалась при первом старте приложения
useGLTF.preload("models/rocks.glb");
