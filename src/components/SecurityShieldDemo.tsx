import React, { memo, useCallback, useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Zap } from 'lucide-react';

interface ProbeLog {
  id: number;
  status: number;
  outcome: 'İzin Verildi' | 'DDoS Kalkanı Engelledi';
  detail: string;
  remaining: number;
  time: string;
}

export const SecurityShieldDemo: React.FC = memo(function SecurityShieldDemo() {
  const [logs, setLogs] = useState<ProbeLog[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(20);
  const [busy, setBusy] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldownSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldownSec]);

  const sendProbe = useCallback(async (seqIndex?: number) => {
    const res = await fetch('/api/security/probe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ check: seqIndex ?? 1 }),
    });
    const data = await res.json();
    const nowLabel = new Date().toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (res.status === 429) {
      setRemaining(0);
      setCooldownSec(Number(data.retryAfterSec) || 10);
      return {
        id: Date.now() + (seqIndex ?? 0),
        status: 429,
        outcome: 'DDoS Kalkanı Engelledi' as const,
        detail: data.error || 'Hız sınırı aşıldı.',
        remaining: 0,
        time: nowLabel,
      };
    }

    const rem = typeof data.remaining === 'number' ? data.remaining : 0;
    const lim = typeof data.limit === 'number' ? data.limit : 20;
    setRemaining(rem);
    setLimit(lim);

    return {
      id: Date.now() + (seqIndex ?? 0),
      status: res.status,
      outcome: 'İzin Verildi' as const,
      detail: data.message || 'İstek doğrulandı.',
      remaining: rem,
      time: nowLabel,
    };
  }, []);

  const handleSingleProbe = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const entry = await sendProbe(1);
      setLogs((prev) => [entry, ...prev].slice(0, 6));
    } catch {
      // Ignore transient network abort gracefully
    } finally {
      setBusy(false);
    }
  }, [busy, sendProbe]);

  const handleBurstTest = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const batch = await Promise.all([1, 2, 3, 4, 5].map((idx) => sendProbe(idx)));
      setLogs((prev) => [...batch.reverse(), ...prev].slice(0, 6));
    } catch {
      // Graceful fallback
    } finally {
      setBusy(false);
    }
  }, [busy, sendProbe]);

  return (
    <div className="theme-surface border rounded-xl p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700/70">
        <div>
          <p className="text-xs font-medium theme-accent-text mb-1">
            Gerçek Sunucu Doğrulaması
          </p>
          <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Canlı Hız Sınırı ve Ani Taşkın Testi
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Sunucumuz 4 saniyede 4&apos;ten fazla ani isteği otomatik olarak keser. Aşağıdaki düğmelerle kalkanın nasıl yanıt verdiğini arayüz donmadan test edebilirsin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSingleProbe}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border theme-surface text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/70 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 theme-accent-text" />
            Tekil İstek Gönder
          </button>

          <button
            type="button"
            onClick={handleBurstTest}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            {busy ? 'Test Ediliyor...' : '5 İsteklik Taşkın Testi'}
          </button>
        </div>
      </div>

      {/* Quota Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-slate-200 dark:border-slate-700/70 text-sm">
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-xs">
            Dakikalık API Kotası
          </span>
          <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-50 text-lg">
            {remaining === null ? `${limit} / ${limit}` : `${remaining} / ${limit} kalan`}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-xs">
            Ani Taşkın Eşiği
          </span>
          <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-50 text-lg">
            4 istek / 4 saniye
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-xs">
            Koruma Durumu
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-50 text-lg flex items-center gap-2">
            {cooldownSec > 0 ? (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Engelleme Aktif ({cooldownSec} sn)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Normal Akış</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Live Response Table */}
      <div className="pt-5">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
            Henüz test isteği gönderilmedi. Sağ üstteki düğmelerden birini kullanarak gerçek sunucu yanıtlarını inceleyebilirsin.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/70 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="py-2 pr-4">Saat</th>
                  <th className="py-2 pr-4">HTTP Kodu</th>
                  <th className="py-2 pr-4">Karar</th>
                  <th className="py-2 pr-4">Açıklama</th>
                  <th className="py-2 text-right">Kalan Kota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {logs.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 pr-4 font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="py-2.5 pr-4 font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-50">
                      {row.status}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap font-medium">
                      {row.status === 429 ? (
                        <span className="text-amber-800 dark:text-amber-300 inline-flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {row.outcome}
                        </span>
                      ) : (
                        <span className="text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {row.outcome}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{row.detail}</td>
                    <td className="py-2.5 font-mono tabular-nums text-right text-slate-800 dark:text-slate-100">
                      {row.remaining}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});
