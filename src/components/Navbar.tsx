import React, { memo, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onJumpToStudio: () => void;
}

const NAV_LINKS = [
  { href: '#video-rehber', label: 'Video' },
  { href: '#nedir', label: 'WipeCoding' },
  { href: '#formul-rehberi', label: 'Rol · Görev · Prompt' },
  { href: '#ogrenci-senaryolari', label: 'Öğrenci Rehberi' },
  { href: '#guvenlik-performans', label: 'Güvenlik ve Hız' },
];

export const Navbar: React.FC<NavbarProps> = memo(function Navbar({ onJumpToStudio }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 theme-header border-b">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
        >
          Kampüs WipeCode
        </a>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav
          aria-label="Ana menü"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onJumpToStudio}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold theme-accent-btn rounded-lg active:translate-y-px transition-[background-color,transform] duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
          >
            Formülü Dene
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border theme-surface text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Compact Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t theme-surface px-4 py-4 space-y-2">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={handleMobileNavClick}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onJumpToStudio();
            }}
            className="w-full mt-2 py-2.5 px-4 text-sm font-semibold theme-accent-btn rounded-lg transition-colors cursor-pointer"
          >
            Formülü Dene
          </button>
        </div>
      )}
    </header>
  );
});
