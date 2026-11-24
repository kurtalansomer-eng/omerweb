import React, { memo } from 'react';
import { Gauge, Moon, Palette, RotateCw, Terminal } from 'lucide-react';
import type { FpsLimit } from './EarthIntro';

export type ThemeHue = 'mavi' | 'turkuaz' | 'yesil' | 'pembe' | 'kirmizi' | 'sari';
export type ThemeMode = 'light' | 'dark';

export interface ThemeOption {
  id: ThemeHue;
  lightLabel: string;
  darkLabel: string;
  lightSwatch: string;
  darkSwatch: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'mavi',
    lightLabel: 'Mavi',
    darkLabel: 'Gece Mavisi',
    lightSwatch: '#3b82f6',
    darkSwatch: '#0f172a',
  },
  {
    id: 'turkuaz',
    lightLabel: 'Turkuaz',
    darkLabel: 'Koyu Turkuaz',
    lightSwatch: '#06b6d4',
    darkSwatch: '#082f3b',
  },
  {
    id: 'yesil',
    lightLabel: 'Yeşil',
    darkLabel: 'Koyu Yeşil',
    lightSwatch: '#10b981',
    darkSwatch: '#0a2e22',
  },
  {
    id: 'pembe',
    lightLabel: 'Pembe',
    darkLabel: 'Koyu Pembe',
    lightSwatch: '#ec4899',
    darkSwatch: '#361129',
  },
  {
    id: 'kirmizi',
    lightLabel: 'Kırmızı',
    darkLabel: 'Koyu Kırmızı',
    lightSwatch: '#ef4444',
    darkSwatch: '#381116',
  },
  {
    id: 'sari',
    lightLabel: 'Sarı',
    darkLabel: 'Koyu Altın',
    lightSwatch: '#eab308',
    darkSwatch: '#30260a',
  },
];

interface ThemeControlsProps {
  mode: ThemeMode;
  hue: ThemeHue;
  fpsLimit: FpsLimit;
  matrixEnabled: boolean;
  onCycleLightTheme: () => void;
  onCycleDarkTheme: () => void;
  onChangeFps: (fps: FpsLimit) => void;
  onToggleMatrix: () => void;
  onReplayIntro: () => void;
}

export const ThemeControls: React.FC<ThemeControlsProps> = memo(function ThemeControls({
  mode,
  hue,
  fpsLimit,
  matrixEnabled,
  onCycleLightTheme,
  onCycleDarkTheme,
  onChangeFps,
  onToggleMatrix,
  onReplayIntro,
}) {
  const activeOption = THEME_OPTIONS.find((item) => item.id === hue) ?? THEME_OPTIONS[0];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700/70">
      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
        Görünüm:{' '}
        <span className="font-semibold text-slate-900 dark:text-slate-50">
          {mode === 'dark' ? activeOption.darkLabel : activeOption.lightLabel}
        </span>
        <span aria-hidden="true" className="mx-2">·</span>
        <span className="font-mono tabular-nums">{fpsLimit} FPS</span>
        <span aria-hidden="true" className="mx-2">·</span>
        <span>Kod Yağmuru: {matrixEnabled ? 'Açık' : 'Kapalı'}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onCycleLightTheme}
          aria-pressed={mode === 'light'}
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            mode === 'light'
              ? 'theme-accent-btn border-transparent'
              : 'theme-surface text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4 shrink-0" />
          <span>Arka Plan ({activeOption.lightLabel})</span>
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 rounded-sm border border-white/60 shrink-0"
            style={{ backgroundColor: activeOption.lightSwatch }}
          />
        </button>

        <button
          type="button"
          onClick={onCycleDarkTheme}
          aria-pressed={mode === 'dark'}
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            mode === 'dark'
              ? 'theme-accent-btn border-transparent'
              : 'theme-surface text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Moon className="w-4 h-4 shrink-0" />
          <span>Koyu Renkler ({activeOption.darkLabel})</span>
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 rounded-sm border border-white/50 shrink-0"
            style={{ backgroundColor: activeOption.darkSwatch }}
          />
        </button>

        <button
          type="button"
          onClick={onToggleMatrix}
          aria-pressed={matrixEnabled}
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
            matrixEnabled
              ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800'
              : 'theme-surface text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4 shrink-0" />
          <span>Kod Yağmuru: {matrixEnabled ? 'Açık' : 'Kapalı'}</span>
        </button>

        {/* Animation FPS Regulator */}
        <div
          role="group"
          aria-label="Animasyon FPS Ayarı"
          className="inline-flex items-center gap-1 p-1 min-h-[44px] sm:min-h-[40px] rounded-lg border theme-surface-muted"
        >
          <span className="inline-flex items-center gap-1 px-2 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
            <Gauge className="w-3.5 h-3.5" />
            FPS
          </span>
          {([30, 60, 120] as FpsLimit[]).map((val) => {
            const active = fpsLimit === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onChangeFps(val)}
                aria-pressed={active}
                className={`min-h-[36px] min-w-[36px] px-2.5 py-1 rounded-md font-mono text-xs tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'theme-surface text-slate-900 dark:text-slate-50 font-semibold border shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onReplayIntro}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[40px] px-3.5 py-2 rounded-lg border theme-surface text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>3D Açılışı İzle</span>
        </button>
      </div>
    </div>
  );
});
