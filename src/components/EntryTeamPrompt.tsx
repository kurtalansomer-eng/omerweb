import React, { memo } from 'react';
import type { FpsLimit } from './EarthIntro';

interface EntryTeamPromptProps {
  onSelect: (fps: FpsLimit) => void;
}

export const EntryTeamPrompt: React.FC<EntryTeamPromptProps> = memo(
  function EntryTeamPrompt({ onSelect }) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-team-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#040914] px-4 text-slate-100"
      >
        <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0b1324] p-6 sm:p-8 text-center">
          <p className="text-xs font-medium text-sky-400 mb-2">
            Kampüs WipeCode · Performans Ayarı
          </p>

          <h1
            id="entry-team-title"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance"
          >
            Fenerbahçeli misin?
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Seçimine göre açılış sahnesi ve sitedeki tüm animasyonlar otomatik olarak{' '}
            <strong className="text-white">120 FPS</strong> veya{' '}
            <strong className="text-white">30 FPS</strong> hızında başlatılır.
          </p>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSelect(120)}
              className="min-h-[48px] px-5 py-3 rounded-lg bg-amber-400 text-slate-950 font-semibold text-sm hover:bg-amber-300 active:translate-y-px transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1324] whitespace-nowrap"
            >
              Evet (120 FPS)
            </button>

            <button
              type="button"
              onClick={() => onSelect(30)}
              className="min-h-[48px] px-5 py-3 rounded-lg border border-slate-600 bg-slate-800/90 text-slate-100 font-semibold text-sm hover:bg-slate-700 active:translate-y-px transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1324] whitespace-nowrap"
            >
              Hayır (30 FPS)
            </button>
          </div>
        </div>
      </div>
    );
  }
);
