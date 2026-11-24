import React, { memo, useEffect, useRef } from 'react';
import type { FpsLimit } from './EarthIntro';
import type { ThemeMode } from './ThemeControls';

interface MatrixRainBackgroundProps {
  enabled: boolean;
  mode: ThemeMode;
  fpsLimit: FpsLimit;
}

const CYBER_CHARS = '01010101#$%@*+=<>{}[]/|\\:;~^ABCDEF0123456789';

export const MatrixRainBackground: React.FC<MatrixRainBackgroundProps> = memo(
  function MatrixRainBackground({ enabled, mode, fpsLimit }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const modeRef = useRef<ThemeMode>(mode);
    const fpsRef = useRef<FpsLimit>(fpsLimit);

    modeRef.current = mode;
    fpsRef.current = fpsLimit;

    useEffect(() => {
      if (!enabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      let width = 0;
      let height = 0;
      let isMobile = false;
      let fontSize = 14;
      let colSpacing = 22;
      let columns = 0;
      let drops: number[] = [];
      let speeds: number[] = [];
      let frameId = 0;
      let resizeTimer = 0;
      let lastDraw = 0;
      let isPaused = document.hidden;

      const setupGrid = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        isMobile = width < 768;

        // Automatic mobile load reduction: DPR=1, wider column spacing (~50% fewer columns)
        const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
        fontSize = isMobile ? 13 : 14;
        colSpacing = isMobile ? 34 : 22;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        columns = Math.max(6, Math.floor(width / colSpacing));
        const maxRows = Math.ceil(height / fontSize);
        drops = new Array(columns);
        speeds = new Array(columns);

        for (let i = 0; i < columns; i++) {
          drops[i] = Math.random() * maxRows;
          speeds[i] = 0.55 + Math.random() * 0.75;
        }
      };

      const drawFrame = (dtSec: number) => {
        const isDark = modeRef.current === 'dark';

        // Scale trail fade and glyph fall distance by real elapsed time so visual speed
        // stays consistent whether running at 30 FPS or 120 FPS
        const stepScale = Math.min(2.0, dtSec * 24);
        const fadeAlpha = isDark
          ? Math.min(0.28, Math.max(0.03, dtSec * 2.4))
          : Math.min(0.32, Math.max(0.04, dtSec * 3.2));

        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = 'source-over';
        ctx.font = `600 ${fontSize}px "IBM Plex Mono", ui-monospace, monospace`;
        ctx.textBaseline = 'top';

        const trailColor = isDark ? '#22c55e' : '#059669';
        const headColor = isDark ? '#bbf7d0' : '#047857';

        for (let i = 0; i < columns; i++) {
          const char = CYBER_CHARS.charAt(
            Math.floor(Math.random() * CYBER_CHARS.length)
          );
          const x = i * colSpacing + 4;
          const y = drops[i] * fontSize;

          ctx.fillStyle = Math.random() > 0.78 ? headColor : trailColor;
          ctx.fillText(char, x, y);

          if (y > height && Math.random() > 0.965) {
            drops[i] = -Math.random() * 6;
          } else {
            drops[i] += speeds[i] * stepScale;
          }
        }
      };

      setupGrid();

      if (prefersReduced) {
        for (let step = 0; step < 18; step++) {
          drawFrame(0.04);
        }
        return;
      }

      const tick = (now: number) => {
        if (isPaused) return;

        // Enforce selected FPS (30 / 60 / 120 FPS)
        const minInterval = 1000 / fpsRef.current;

        if (now - lastDraw >= minInterval * 0.92) {
          const dtSec = lastDraw === 0 ? 0.033 : Math.min(0.1, (now - lastDraw) / 1000);
          lastDraw = now;
          drawFrame(dtSec);
        }

        frameId = requestAnimationFrame(tick);
      };

      const handleVisibility = () => {
        isPaused = document.hidden;
        if (!isPaused) {
          lastDraw = performance.now();
          frameId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(frameId);
        }
      };

      const handleResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          setupGrid();
        }, 180);
      };

      document.addEventListener('visibilitychange', handleVisibility);
      window.addEventListener('resize', handleResize, { passive: true });
      frameId = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(frameId);
        window.clearTimeout(resizeTimer);
        document.removeEventListener('visibilitychange', handleVisibility);
        window.removeEventListener('resize', handleResize);
      };
    }, [enabled]);

    if (!enabled) {
      return null;
    }

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-300 ${
          mode === 'dark' ? 'opacity-[0.26]' : 'opacity-[0.15]'
        }`}
      />
    );
  }
);
