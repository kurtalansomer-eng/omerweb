import React, { memo, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import type { FpsLimit } from './EarthIntro';

interface TopAnimationBannerProps {
  fpsLimit: FpsLimit;
}

const BANNER_ITEMS = [
  'Lise Öğrencileri İçin WipeCoding Atölyesi',
  'Rol + Görev + Prompt Formülüyle Fikrini Canlandır',
  'Kod Ezberlemeden Saatler İçinde Proje Üret',
  'DDoS Korumalı Güvenli Web Mimarisi',
  'Sıfır Kasma · GPU Dostu Akıcı Arayüz',
];

export const TopAnimationBanner: React.FC<TopAnimationBannerProps> = memo(
  function TopAnimationBanner({ fpsLimit }) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const fpsRef = useRef<FpsLimit>(fpsLimit);
    const hoveredRef = useRef(false);

    fpsRef.current = fpsLimit;

    useEffect(() => {
      const track = trackRef.current;
      if (!track) return;

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      let offsetPx = 0;
      let lastRenderTime = performance.now();
      let lastTickTime = performance.now();
      let frameId = 0;
      let paused = document.hidden;

      // Pixels per second smooth kinetic travel
      const speedPxPerSec = 52;

      const tick = (now: number) => {
        if (paused) return;

        const targetInterval = 1000 / fpsRef.current;
        if (now - lastRenderTime >= targetInterval * 0.92) {
          const dt = Math.min(0.1, (now - lastTickTime) / 1000);
          lastTickTime = now;
          lastRenderTime = now;

          if (!hoveredRef.current) {
            const halfWidth = track.scrollWidth / 2;
            if (halfWidth > 0) {
              offsetPx = (offsetPx + speedPxPerSec * dt) % halfWidth;
              track.style.transform = `translate3d(-${offsetPx.toFixed(2)}px, 0, 0)`;
            }
          }
        } else {
          lastTickTime = now;
        }

        frameId = requestAnimationFrame(tick);
      };

      const handleVisibility = () => {
        paused = document.hidden;
        if (!paused) {
          lastTickTime = performance.now();
          lastRenderTime = performance.now();
          frameId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(frameId);
        }
      };

      document.addEventListener('visibilitychange', handleVisibility);
      frameId = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(frameId);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    }, []);

    return (
      <div
        role="region"
        aria-label="Sürekli animasyonlu tanıtım şeridi"
        onMouseEnter={() => {
          hoveredRef.current = true;
        }}
        onMouseLeave={() => {
          hoveredRef.current = false;
        }}
        className="relative overflow-hidden border-b border-black/10 dark:border-white/10 theme-accent-btn select-none"
      >
        {/* Subtle GPU-only moving light sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-1/3 banner-sheen bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        {/* Dual-track FPS-regulated marquee */}
        <div
          ref={trackRef}
          className="flex w-max items-center py-2 will-change-transform"
        >
          {[0, 1].map((loopIndex) => (
            <div
              key={loopIndex}
              aria-hidden={loopIndex === 1}
              className="flex items-center shrink-0"
            >
              {BANNER_ITEMS.map((text, idx) => (
                <div key={`${loopIndex}-${idx}`} className="flex items-center shrink-0">
                  <span className="px-4 text-xs sm:text-[13px] font-semibold tracking-wide text-white whitespace-nowrap">
                    {text}
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center text-white/80 banner-spin"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
