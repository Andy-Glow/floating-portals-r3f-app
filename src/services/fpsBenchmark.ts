/**
 * Сервис для фонового замера производительности (FPS Benchmark).
 * Запускает цикл requestAnimationFrame на определенное время
 * и вычисляет среднее время рендеринга кадра на текущем устройстве.
 */
export class FpsBenchmark {
  private lastTime: number = 0;
  private frameTimes: number[] = [];
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  /**
   * Запускает микро-тест замера производительности.
   * @param duration Время теста в миллисекундах (по умолчанию 1000мс = 1 секунда)
   * @returns Обещание, возвращающее средний FPS по окончании теста
   */
  public startTest(duration: number = 1000): Promise<number> {
    if (this.isRunning) return Promise.resolve(60);
    this.isRunning = true;
    this.frameTimes = [];
    this.lastTime = performance.now();

    return new Promise((resolve) => {
      const loop = (now: number) => {
        if (!this.isRunning) return;

        // Вычисляем время, затраченное на отрисовку текущего кадра (Delta Time)
        const delta = now - this.lastTime;
        this.lastTime = now;

        // Игнорируем первый кадр инициализации, чтобы исключить стартовые фризы
        if (delta > 0 && delta < 200) {
          this.frameTimes.push(delta);
        }

        this.animationFrameId = requestAnimationFrame(loop);
      };

      // Запускаем цикл requestAnimationFrame
      this.animationFrameId = requestAnimationFrame(loop);

      // Завершаем тест строго по таймеру duration
      setTimeout(() => {
        this.stopTest();
        resolve(this.calculateAverageFps());
      }, duration);
    });
  }

  /**
   * Останавливает цикл замера и очищает системные анимационные кадры.
   */
  private stopTest(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Рассчитывает средний FPS на основе накопленных интервалов времени.
   */
  private calculateAverageFps(): number {
    if (this.frameTimes.length === 0) return 60;

    // Считаем среднее время кадра (в миллисекундах)
    const sum = this.frameTimes.reduce((acc, val) => acc + val, 0);
    const avgFrameTime = sum / this.frameTimes.length;

    // Переводим время кадра в количество кадров в секунду (FPS)
    // 1000мс / 16.66мс = 60 FPS
    const fps = 1000 / avgFrameTime;

    // Возвращаем округленное число FPS, ограниченное разумными рамками
    return Math.min(Math.max(Math.round(fps), 1), 240);
  }
}

// Экспортируем одиночный экземпляр сервиса для использования в приложении
export const fpsBenchmark = new FpsBenchmark();
