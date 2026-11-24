import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ResilientImage } from './components/ResilientImage';
import { FormulaStudio } from './components/FormulaStudio';
import { SecurityShieldDemo } from './components/SecurityShieldDemo';
import { EarthIntro, FpsLimit } from './components/EarthIntro';
import { EntryTeamPrompt } from './components/EntryTeamPrompt';
import { TopAnimationBanner } from './components/TopAnimationBanner';
import { MatrixRainBackground } from './components/MatrixRainBackground';
import { VideoShowcase } from './components/VideoShowcase';
import {
  THEME_OPTIONS,
  ThemeControls,
  ThemeHue,
  ThemeMode,
} from './components/ThemeControls';
import {
  PERFORMANCE_MEASURES,
  SECURITY_MEASURES,
  STUDENT_SCENARIOS,
} from './data/wipecodingContent';

const HERO_IMAGE = '/src/assets/images/hero_highschool_wipecoding_1795530300900.jpg';
const FORMULA_IMAGE = '/src/assets/images/formula_highschool_desk_1795530301406.jpg';
const CAMPUS_IMAGE = '/src/assets/images/highschool_club_teamwork_1795530301998.jpg';

const THEME_STORAGE_KEY = 'kampus_wipecode_theme_v1';
const FPS_STORAGE_KEY = 'kampus_wipecode_fps_v1';
const MATRIX_STORAGE_KEY = 'kampus_wipecode_matrix_v1';

function readInitialTheme(): { mode: ThemeMode; hue: ThemeHue } {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return { mode: 'light', hue: 'mavi' };
    const parsed = JSON.parse(raw) as { mode?: string; hue?: string };
    const validMode: ThemeMode = parsed.mode === 'dark' ? 'dark' : 'light';
    const validHue = THEME_OPTIONS.some((o) => o.id === parsed.hue)
      ? (parsed.hue as ThemeHue)
      : 'mavi';
    return { mode: validMode, hue: validHue };
  } catch {
    return { mode: 'light', hue: 'mavi' };
  }
}

function readInitialFps(): FpsLimit {
  try {
    const raw = Number(window.localStorage.getItem(FPS_STORAGE_KEY));
    if (raw === 30 || raw === 60 || raw === 120) return raw;
    return 60;
  } catch {
    return 60;
  }
}

function readInitialMatrix(): boolean {
  try {
    const raw = window.localStorage.getItem(MATRIX_STORAGE_KEY);
    if (raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export default function App() {
  const [theme, setTheme] = useState<{ mode: ThemeMode; hue: ThemeHue }>(readInitialTheme);
  const [fpsLimit, setFpsLimit] = useState<FpsLimit>(readInitialFps);
  const [matrixEnabled, setMatrixEnabled] = useState<boolean>(readInitialMatrix);
  const [awaitingTeamAnswer, setAwaitingTeamAnswer] = useState<boolean>(true);
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [siteVisible, setSiteVisible] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.hue = theme.hue;
    root.classList.toggle('dark', theme.mode === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch {
      // Ignore storage failures in restricted browsers
    }
  }, [theme]);

  useEffect(() => {
    const duration = fpsLimit === 30 ? '240ms' : fpsLimit === 120 ? '120ms' : '180ms';
    document.documentElement.style.setProperty('--motion-duration', duration);
    try {
      window.localStorage.setItem(FPS_STORAGE_KEY, String(fpsLimit));
    } catch {
      // Ignore storage failures
    }
  }, [fpsLimit]);

  const handleCycleLightTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev.mode === 'dark') {
        return { mode: 'light', hue: prev.hue };
      }
      const idx = THEME_OPTIONS.findIndex((item) => item.id === prev.hue);
      const next = THEME_OPTIONS[(idx + 1) % THEME_OPTIONS.length];
      return { mode: 'light', hue: next.id };
    });
  }, []);

  const handleCycleDarkTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev.mode === 'light') {
        return { mode: 'dark', hue: prev.hue };
      }
      const idx = THEME_OPTIONS.findIndex((item) => item.id === prev.hue);
      const next = THEME_OPTIONS[(idx + 1) % THEME_OPTIONS.length];
      return { mode: 'dark', hue: next.id };
    });
  }, []);

  const handleTeamAnswer = useCallback((selectedFps: FpsLimit) => {
    setFpsLimit(selectedFps);
    setAwaitingTeamAnswer(false);
    setShowIntro(true);
  }, []);

  const handleIntroFadeStart = useCallback(() => {
    setSiteVisible(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setSiteVisible(true);
    setShowIntro(false);
  }, []);

  const handleReplayIntro = useCallback(() => {
    setSiteVisible(false);
    setShowIntro(true);
  }, []);

  const handleToggleMatrix = useCallback(() => {
    setMatrixEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(MATRIX_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage failures
      }
      return next;
    });
  }, []);

  const scrollToStudio = useCallback(() => {
    const el = document.getElementById('formul-studyosu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      {awaitingTeamAnswer && <EntryTeamPrompt onSelect={handleTeamAnswer} />}

      {!awaitingTeamAnswer && showIntro && (
        <EarthIntro
          fpsLimit={fpsLimit}
          onChangeFps={setFpsLimit}
          onFadeStart={handleIntroFadeStart}
          onComplete={handleIntroComplete}
        />
      )}

      <div
        id="top"
        className={`relative min-h-screen overflow-x-clip campus-grid-surface text-slate-900 dark:text-slate-100 flex flex-col transition-opacity duration-700 ease-out ${
          siteVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <MatrixRainBackground
          enabled={matrixEnabled && siteVisible}
          mode={theme.mode}
          fpsLimit={fpsLimit}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          <TopAnimationBanner fpsLimit={fpsLimit} />
          <Navbar onJumpToStudio={scrollToStudio} />

          <main className="flex-1">
            {/* ================================================================
                SECTION 1: HERO (Student Perspective)
               ================================================================ */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-8 sm:pb-16">
              {/* Interactive Theme & Dark Color Switchers */}
              <ThemeControls
                mode={theme.mode}
                hue={theme.hue}
                fpsLimit={fpsLimit}
                matrixEnabled={matrixEnabled}
                onCycleLightTheme={handleCycleLightTheme}
                onCycleDarkTheme={handleCycleDarkTheme}
                onChangeFps={setFpsLimit}
                onToggleMatrix={handleToggleMatrix}
                onReplayIntro={handleReplayIntro}
              />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch pt-8 sm:pt-10">
            {/* Left Copy Column */}
            <div className="lg:col-span-6 flex flex-col justify-between py-2">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <span>Öğrenci Penceresinden</span>
                  <span aria-hidden="true">·</span>
                  <span>WipeCoding Rehberi</span>
                  <span aria-hidden="true">·</span>
                  <span>Güvenli Web Mimarisi</span>
                </p>

                <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.08] text-slate-900 dark:text-slate-50 text-balance">
                  Kod ezberleyerek değil, fikrini net anlatarak üret.
                </h1>

                <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl">
                  WipeCoding (Vibe Coding), vize haftasında noktalı virgül veya CSS hizalama hatasıyla saatler kaybetmek yerine; ne istediğini doğru formülle anlatıp dakikalar içinde çalışan projeler geliştirme yaklaşımıdır.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToStudio}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg theme-accent-btn text-sm font-semibold active:translate-y-px transition-[background-color,transform] duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                >
                  Formül Stüdyosunu Aç
                  <ArrowDownRight className="w-4 h-4" />
                </button>

                <a
                  href="#formul-rehberi"
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition-colors whitespace-nowrap shrink-0"
                >
                  Rol + Görev + Prompt Yazısını Oku
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-6">
              <div className="h-full rounded-xl overflow-hidden border theme-surface">
                <ResilientImage
                  src={HERO_IMAGE}
                  alt="Okul atölyesinde renkli notlar ve dizüstü bilgisayarla neşeyle WipeCoding projesi geliştiren lise öğrencileri"
                  aspectClassName="aspect-video lg:aspect-auto lg:h-full w-full object-cover"
                  fallbackTitle="Lise atölyesinde renkli proje çalışması"
                  priority
                />
              </div>
            </div>
          </div>

          {/* 4-Column Summary Strip directly below hero */}
          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700/70 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                3 Katman
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Rol, Görev ve Prompt iskeleti ile tutarlı çıktılar
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                20 İstek/Dk
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Kayan pencere ve ani taşkın DDoS hız koruması
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                16 KB Sınır
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Gövde boyutu ve 5 sn soket zaman aşımı savunması
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                60 FPS Akış
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Hafif statik arka plan ve kasmayan arayüz mimarisi
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================
            VIDEO SHOWCASE (Embedded YouTube Guide)
           ================================================================ */}
        <VideoShowcase />

        {/* ================================================================
            SECTION 2: NEDİR BU WIPECODING? (Student Perspective)
           ================================================================ */}
        <section
          id="nedir"
          className="perf-section border-t theme-section-alt py-16 sm:py-20"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-5">
                <p className="text-xs font-medium theme-accent-text mb-2">
                  Öğrenci Penceresinden Bakış
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
                  WipeCoding tembellik değil, doğru yönlendirme sanatıdır.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  Bir öğrenci olarak elinde fikir var ama her programlama dilinin sözdizimini ezberlemeye vaktin yok. WipeCoding, yapay zekâyı senin yerine düşünen bir sihirbaz olarak değil; senin mimari kararlarını koda döken hızlı bir laboratuvar arkadaşı olarak kullanmaktır.
                </p>

                <div className="mt-6 rounded-xl overflow-hidden border theme-surface-muted">
                  <ResilientImage
                    src={CAMPUS_IMAGE}
                    alt="Lise teknoloji kulübü odasında renkli tahta önünde projelerini tasarlayan neşeli öğrenciler"
                    aspectClassName="aspect-[4/3] w-full object-cover"
                    fallbackTitle="Lise teknoloji kulübü ekip çalışması"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-xl border theme-surface-muted p-6">
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Öğrencinin Gerçek Kazancı Nedir?
                  </h3>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    Eskiden boş bir editör ekranına bakıp kurulum hatalarıyla uğraşırken motivasyonun düşerdi. WipeCoding ile enerjini doğrudan problemin kendisine, kullanıcı deneyimine ve güvenlik kontrollerine harcarsın. Çıkan kodu okuyup test ettikçe yazılım mantığını da pratik yaparak öğrenirsin.
                  </p>
                </div>

                <div
                  id="ogrenci-senaryolari"
                  className="divide-y divide-slate-200 dark:divide-slate-700/70 border theme-surface rounded-xl"
                >
                  {STUDENT_SCENARIOS.map((item) => (
                    <div key={item.number} className="p-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {item.number}. {item.title}
                        </h3>
                        <span className="font-mono text-xs font-medium theme-accent-text tabular-nums">
                          {item.timeSaved}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                            Alışılmış Tıkanma
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.oldWay}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                            WipeCoding Yaklaşımı
                          </span>
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                            {item.wipeWay}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 3: ROL, GÖREV VE PROMPT FORMÜLÜ (Editorial Article + Studio)
           ================================================================ */}
        <section
          id="formul-rehberi"
          className="perf-section border-t border-slate-200 dark:border-slate-700/70 py-16 sm:py-20"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
            {/* Editorial Article */}
            <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <p className="text-xs font-medium theme-accent-text mb-2">
                    Temel Metodoloji Yazısı
                  </p>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
                    Rol + Görev + Prompt Formülü Nasıl Çalışır?
                  </h2>
                  <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                    Yapay zekâya sadece <em>&ldquo;Bana güzel bir web sitesi yap&rdquo;</em> yazdığında rastgele renkler, eksik butonlar ve kopya bir düzen alırsın. Çünkü model kim adına düşüneceğini, sınırlarının ne olduğunu ve hangi öğrenci ihtiyacını çözeceğini bilmez. Çözüm üç adımlı net formüldedir:
                  </p>
                </div>

                {/* 3 Formula Steps in Clean Editorial Layout */}
                <div className="space-y-6 pt-2">
                  <div className="border-t border-slate-200 dark:border-slate-700/70 pt-5">
                    <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                      01. Rol: Yapay Zekâya Uzmanlık Şapkası Giydir
                    </h3>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                      İlk cümlede karşındaki asistanın kimliğini tanımla. Öğrenciysen ona hem üretici hem de açıklayıcı bir rol ver. Örneğin: <strong className="text-slate-900 dark:text-slate-50">&ldquo;Sen erişilebilir, sade ve hızlı web uygulamaları kuran kıdemli bir frontend tasarımcısısın.&rdquo;</strong> Bu tek cümle, üretilecek kodun kalitesini ve gereksiz süslerden uzak durmasını doğrudan belirler.
                    </p>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700/70 pt-5">
                    <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                      02. Görev: Tek Cümlede Somut Çıktıyı İste
                    </h3>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                      İkinci adımda belirsiz hayaller yerine ölçülebilir bir iş emri ver. Hangi sayfalar, hangi etkileşimler ve hangi problem çözülecek? Örneğin: <strong className="text-slate-900 dark:text-slate-50">&ldquo;Bölüm kulübümüzün haftalık etkinliklerini listeleyen ve doğrulamalı üye formu içeren tek sayfalık bir site oluştur.&rdquo;</strong> Net görev, yarıda kalmış taslakları önler.
                    </p>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700/70 pt-5">
                    <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                      03. Prompt (Kısıtlar ve Bağlam): Kaliteyi Garantiye Al
                    </h3>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                      Öğrencilerin en sık atladığı ama sonucu profesyonelleştiren bölüm burasıdır. Renk paletini, mobil uyumu, güvenlik kurallarını ve performans sınırlarını açıkça yaz: <strong className="text-slate-900 dark:text-slate-50">&ldquo;Açık gri zemin ve tek vurgu rengi kullan, ağır arka plan animasyonları ekleme, API uç noktalarını hız sınırı ile koru ve tüm metinleri Türkçe yaz.&rdquo;</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column Visual & Formula Equation Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl overflow-hidden border theme-surface">
                  <ResilientImage
                    src={FORMULA_IMAGE}
                    alt="Renkli çıkartmalı dizüstü bilgisayar, parlak kalemler ve turkuaz-sarı-mercan indeks kartlarıyla lise öğrenci masası"
                    aspectClassName="aspect-[4/3] w-full object-cover"
                    fallbackTitle="Renkli lise çalışma masası ve formül kartları"
                  />
                </div>

                <div className="rounded-xl border theme-surface p-6">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                    Altın Özet Denklem
                  </p>
                  <p className="font-mono text-sm leading-relaxed text-slate-900 dark:text-slate-100 theme-surface-muted border rounded-lg p-4">
                    Net Sonuç = (Doğru Rol) + (Ölçülebilir Görev) + (Tasarım ve Güvenlik Kısıtları)
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    İpucu: Tek bir dev paragraf yazmak yerine her üç katmanı ayrı ayrı düzenle. Eksik bir parça gördüğünde sadece o katmanı güncelleyerek ikinci denemede kusursuz sonuca ulaşırsın.
                  </p>
                </div>
              </div>
            </article>

            {/* Interactive Formula Studio */}
            <FormulaStudio />
          </div>
        </section>

        {/* ================================================================
            SECTION 4: DDOS GÜVENLİK ÖNLEMLERİ VE KASMA/DONMA MİMARİSİ
           ================================================================ */}
        <section
          id="guvenlik-performans"
          className="perf-section border-t theme-section-alt py-16 sm:py-20"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-14">
            {/* Section Intro */}
            <div className="max-w-2xl">
              <p className="text-xs font-medium theme-accent-text mb-2">
                Savunma ve Hız Mühendisliği
              </p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
                DDoS Koruması ve Sıfır Kasma Önlemleri
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Bir öğrenci projesi yayına çıktığında hem ani trafik taşkınlarına karşı ayakta kalmalı hem de düşük donanımlı bir dizüstü bilgisayarda bile takılmadan çalışmalıdır. Bu sitede uygulanan gerçek güvenlik ve performans katmanları aşağıdadır.
              </p>
            </div>

            {/* Two Balanced Lists: Security vs Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* DDoS Security Column */}
              <div className="rounded-xl border theme-surface-muted p-6 sm:p-8">
                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50 pb-4 border-b border-slate-200 dark:border-slate-700/70">
                  DDoS ve Taşkın Saldırılarına Karşı Alınan Önlemler
                </h3>
                <div className="divide-y divide-slate-200 dark:divide-slate-700/70">
                  {SECURITY_MEASURES.map((item) => (
                    <div key={item.number} className="py-5 first:pt-5 last:pb-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                          {item.number}. {item.title}
                        </h4>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {item.layer}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.summary}
                      </p>
                      <p className="mt-2 font-mono text-xs text-slate-700 dark:text-slate-200 theme-surface border rounded-md px-3 py-2">
                        {item.technicalDetail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-Lag / Performance Column */}
              <div className="rounded-xl border theme-surface-muted p-6 sm:p-8">
                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50 pb-4 border-b border-slate-200 dark:border-slate-700/70">
                  Arka Plan ve Kasma / Donma Önlemleri
                </h3>
                <div className="divide-y divide-slate-200 dark:divide-slate-700/70">
                  {PERFORMANCE_MEASURES.map((item) => (
                    <div key={item.number} className="py-5 first:pt-5 last:pb-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                          {item.number}. {item.title}
                        </h4>
                        <span className="text-xs font-medium theme-accent-text whitespace-nowrap">
                          {item.impact}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Server Rate-Limiter Test */}
            <SecurityShieldDemo />
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700/70 py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
              Kampüs WipeCode
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Öğrenciler için yapılandırılmış WipeCoding, Rol + Görev + Prompt rehberi ve güvenli web mimarisi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <a href="#video-rehber" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Video
            </a>
            <a href="#nedir" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              WipeCoding
            </a>
            <a href="#formul-rehberi" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Formül Yazısı
            </a>
            <a href="#formul-studyosu" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Formül Stüdyosu
            </a>
            <a href="#guvenlik-performans" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Güvenlik ve Hız
            </a>
          </div>
        </div>
      </footer>
        </div>
      </div>
    </>
  );
}
