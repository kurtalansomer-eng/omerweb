import React, { memo } from 'react';
import { ExternalLink, Play } from 'lucide-react';

const YOUTUBE_VIDEO_ID = 'LSrvLPbdIm0';
const YOUTUBE_WATCH_URL = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`;
const YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`;

export const VideoShowcase: React.FC = memo(function VideoShowcase() {
  return (
    <section
      id="video-rehber"
      className="perf-section border-t border-slate-200 dark:border-slate-700/70 py-14 sm:py-18"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Editorial Context */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <p className="text-xs font-medium theme-accent-text mb-2 flex items-center gap-2">
                <Play className="w-3.5 h-3.5 shrink-0" />
                <span>Video Anlatım</span>
                <span aria-hidden="true">·</span>
                <span>Öne Çıkan İçerik</span>
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
                İzle, Kavra ve Hemen Uygula.
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                WipeCoding yaklaşımını adım adım görmek için aşağıdaki videoyu ana sayfadan ayrılmadan izleyebilir, ardından hemen alttaki formül stüdyosunda kendi projenin istemini kurabilirsin.
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700/70 pt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-slate-100">Hafif Gömülü Oynatıcı:</strong>{' '}
                Video yalnızca ekrana geldiğinde yüklenir; sayfa açılış hızını ve 3D animasyon akıcılığını etkilemez.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-slate-100">Tam Ekran ve Mobil Uyum:</strong>{' '}
                Telefon ve tablet ekranlarında 16:9 oranını koruyarak taşma yapmadan çalışır.
              </p>
            </div>

            <div>
              <a
                href={YOUTUBE_WATCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[44px] sm:min-h-[40px] px-4 py-2 rounded-lg border theme-surface text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <span>YouTube&apos;da Aç</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Framed 16:9 Video Player */}
          <div className="lg:col-span-8">
            <div className="theme-surface border rounded-xl p-2 sm:p-3">
              <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-950">
                <iframe
                  src={YOUTUBE_EMBED_URL}
                  title="Kampüs WipeCode Video Rehberi"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
