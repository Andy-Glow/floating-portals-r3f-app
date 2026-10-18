import { Sparkles } from "@react-three/drei";

// ОПТИМИЗАЦИЯ ПАМЯТИ: Выносим все массивы позиций и масштабов наружу,
// чтобы разгрузить Garbage Collector при покачивании сцены.
const PINK_POS_1: [number, number, number] = [3.5, 11.5, -5];
const PINK_SCALE_1: [number, number, number] = [5, 3.5, 2];

const PINK_POS_2: [number, number, number] = [-1.5, 12, -5];
const PINK_SCALE_2: [number, number, number] = [5, 3.5, 2.5];

const PINK_POS_3: [number, number, number] = [1, 8, -4];
const PINK_SCALE_3: [number, number, number] = [5, 3.5, 2.5];

const GOLD_POS_1: [number, number, number] = [0, 6, 0];
const GOLD_SCALE_1: [number, number, number] = [12, 2, 12];

const GOLD_POS_2: [number, number, number] = [-5, 9, -5];
const GOLD_SCALE_2: [number, number, number] = [4, 4, 4];

const GOLD_POS_3: [number, number, number] = [5.5, 9, -8];
const GOLD_SCALE_3: [number, number, number] = [5, 5, 5];

export function SceneParticles() {
  return (
    <>
      {/* ГРУППА 1: МАГИЧЕСКИЕ РОЗОВЫЕ ОГОНЬКИ (КОНТРАСТ НАД ПОРТАЛОМ И СКЛАМИ) */}
      <Sparkles
        position={PINK_POS_1}
        count={50}
        scale={PINK_SCALE_1}
        color='#ffaacc'
        size={6}
        speed={0.2}
        noise={0.1}
        opacity={0.8}
      />

      <Sparkles
        position={PINK_POS_2}
        count={50}
        scale={PINK_SCALE_2}
        color='#ffaacc'
        size={6}
        speed={0.2}
        noise={0.1}
        opacity={0.8}
      />

      <Sparkles
        position={PINK_POS_3}
        count={50}
        scale={PINK_SCALE_3}
        color='#ffaacc'
        size={6}
        speed={0.2}
        noise={0.1}
        opacity={0.8}
      />

      {/* ГРУППА 2: КРУПНЫЕ ЗОЛОТЫЕ ЧАСТИЦЫ (ЭФФЕКТ КИНЕМАТОГРАФИЧНОГО БОКЕ НА ПЕРЕДНЕМ ПЛАНЕ) */}
      <Sparkles
        position={GOLD_POS_1}
        count={50}
        scale={GOLD_SCALE_1}
        color='#ffe6a8'
        size={10} // Большой размер заставит DepthOfField превратить их в сочные размытые диски
        speed={0.2}
        noise={0.2}
        opacity={0.8}
      />

      {/* ГРУППА 3: ТЕПЛОЕ ЗОЛОТОЕ СВЕЧЕНИЕ СЛЕВА И СПРАВА ВОКРУГ ОСТРОВА */}
      <Sparkles
        position={GOLD_POS_2}
        count={50}
        scale={GOLD_SCALE_2}
        color='#ffe6a8'
        size={6}
        speed={0.2}
        noise={0.2}
        opacity={0.8}
      />

      <Sparkles
        position={GOLD_POS_3}
        count={50}
        scale={GOLD_SCALE_3}
        color='#ffe6a8'
        size={6}
        speed={0.2}
        noise={0.2}
        opacity={0.8}
      />
    </>
  );
}
