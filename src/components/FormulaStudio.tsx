import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Copy, RotateCcw, Sparkles } from 'lucide-react';
import { FORMULA_PRESETS, FormulaPreset } from '../data/wipecodingContent';

interface FormulaCheck {
  key: 'rol' | 'gorev' | 'prompt';
  label: string;
  passed: boolean;
  note: string;
}

interface EvaluationResult {
  status: string;
  passedCount: number;
  totalChecks: number;
  checks: FormulaCheck[];
  assembledPrompt: string;
}

export const FormulaStudio: React.FC = memo(function FormulaStudio() {
  const initialPreset = FORMULA_PRESETS[0];
  const [activePresetId, setActivePresetId] = useState<string>(initialPreset.id);
  const [rol, setRol] = useState<string>(initialPreset.rol);
  const [gorev, setGorev] = useState<string>(initialPreset.gorev);
  const [prompt, setPrompt] = useState<string>(initialPreset.prompt);

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastSubmitAtRef = useRef<number>(0);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldownSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldownSec]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const assembledPreview = useMemo(() => {
    return `[ROL]: ${rol.trim() || '...'}\n\n[GÖREV]: ${gorev.trim() || '...'}\n\n[PROMPT & KISITLAR]: ${prompt.trim() || '...'}`;
  }, [rol, gorev, prompt]);

  const handleSelectPreset = useCallback((preset: FormulaPreset) => {
    setActivePresetId(preset.id);
    setRol(preset.rol);
    setGorev(preset.gorev);
    setPrompt(preset.prompt);
    setEvaluation(null);
    setErrorMsg(null);
  }, []);

  const handleReset = useCallback(() => {
    setActivePresetId('');
    setRol('');
    setGorev('');
    setPrompt('');
    setEvaluation(null);
    setErrorMsg(null);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(evaluation?.assembledPrompt ?? assembledPreview);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setErrorMsg('Pano erişimi engellendi; metni seçerek manuel kopyalayabilirsiniz.');
    }
  }, [assembledPreview, evaluation]);

  const handleEvaluate = useCallback(async () => {
    const now = Date.now();
    if (now - lastSubmitAtRef.current < 900 || loading || cooldownSec > 0) {
      return;
    }

    if (!rol.trim() && !gorev.trim() && !prompt.trim()) {
      setErrorMsg('Değerlendirme için en az bir alanı doldurmalısın.');
      return;
    }

    lastSubmitAtRef.current = now;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/formula/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol: rol.slice(0, 400),
          gorev: gorev.slice(0, 500),
          prompt: prompt.slice(0, 900),
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (response.status === 429) {
        const wait = Number(data.retryAfterSec) || 5;
        setCooldownSec(wait);
        setErrorMsg(data.error || `Çok hızlı istek gönderildi. ${wait} sn bekle.`);
        return;
      }

      if (!response.ok || !data.ok) {
        setErrorMsg(data.error || 'Formül değerlendirilemedi.');
        return;
      }

      setEvaluation(data.evaluation);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setErrorMsg('Sunucuya bağlanırken bir kesinti oluştu.');
      }
    } finally {
      setLoading(false);
    }
  }, [rol, gorev, prompt, loading, cooldownSec]);

  return (
    <div
      id="formul-studyosu"
      className="theme-surface border rounded-xl p-6 sm:p-8"
    >
      {/* Header & Student Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700/70">
        <div>
          <p className="text-xs font-medium theme-accent-text mb-1">
            Etkileşimli Formül Stüdyosu
          </p>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Kendi Rol + Görev + Prompt Çıktını Oluştur
          </h3>
        </div>

        <div
          role="tablist"
          aria-label="Öğrenci senaryo şablonları"
          className="flex flex-wrap items-center gap-1.5 p-1 theme-surface-muted border rounded-lg"
        >
          {FORMULA_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'theme-surface text-slate-900 dark:text-slate-50 shadow-xs border'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Left: Input Fields */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="rol-input" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                1. Rol (Yapay zekâ hangi şapkayı takacak?)
              </label>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {rol.length}/400
              </span>
            </div>
            <textarea
              id="rol-input"
              rows={2}
              maxLength={400}
              value={rol}
              onChange={(e) => {
                setActivePresetId('');
                setRol(e.target.value);
              }}
              placeholder="Örn: Sen üniversite öğrencilerine modern web tasarımı öğreten deneyimli bir arayüz mimarısın."
              className="w-full rounded-lg border theme-input px-3.5 py-2.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="gorev-input" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                2. Görev (Somut olarak ne üretilecek?)
              </label>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {gorev.length}/500
              </span>
            </div>
            <textarea
              id="gorev-input"
              rows={3}
              maxLength={500}
              value={gorev}
              onChange={(e) => {
                setActivePresetId('');
                setGorev(e.target.value);
              }}
              placeholder="Örn: Vize haftasında ders konularını süre bloklarına bölen tek sayfalık bir takip aracı oluştur."
              className="w-full rounded-lg border theme-input px-3.5 py-2.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="prompt-input" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                3. Prompt — Kısıtlar, Bağlam ve Güvenlik Kuralları
              </label>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {prompt.length}/900
              </span>
            </div>
            <textarea
              id="prompt-input"
              rows={3}
              maxLength={900}
              value={prompt}
              onChange={(e) => {
                setActivePresetId('');
                setPrompt(e.target.value);
              }}
              placeholder="Örn: Sade açık tema kullan, mobil uyumlu olsun, kasma yapan ağır efektler koyma ve tüm form alanlarını doğrula."
              className="w-full rounded-lg border theme-input px-3.5 py-2.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={loading || cooldownSec > 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg theme-accent-btn text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {loading
                ? 'Kontrol Ediliyor...'
                : cooldownSec > 0
                  ? `Bekleme (${cooldownSec} sn)`
                  : 'Formülü Değerlendir'}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border theme-surface text-slate-700 dark:text-slate-200 text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Kopyalandı' : 'Metni Kopyala'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Temizle
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-amber-300 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/60 px-4 py-3 text-sm text-amber-900 dark:text-amber-200"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right: Live Assembled Preview & Server Check Output */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="rounded-lg border theme-surface-muted p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Birleştirilmiş İstem Çıktısı
              </span>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {assembledPreview.length} karakter
              </span>
            </div>
            <pre className="font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words theme-surface border rounded-md p-4 min-h-[190px]">
              {evaluation?.assembledPrompt ?? assembledPreview}
            </pre>

            {/* Evaluation Checklist */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/70">
              {evaluation ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {evaluation.status}
                    </span>
                    <span className="font-mono text-xs tabular-nums font-medium text-slate-600 dark:text-slate-300">
                      {evaluation.passedCount}/{evaluation.totalChecks} ölçüt tamam
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {evaluation.checks.map((item) => (
                      <li key={item.key} className="flex items-start gap-2.5 text-xs">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.label} ({item.passed ? 'Uygun' : 'Eksik'}):{' '}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">{item.note}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  Sol taraftaki alanları doldurup <strong className="text-slate-900 dark:text-slate-100">Formülü Değerlendir</strong> düğmesine tıkladığında sunucu, girdilerini XSS karakterlerinden arındırır ve üç temel kurala göre denetler.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
