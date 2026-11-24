import express, { NextFunction, Request, Response } from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ============================================================================
// Bounded-Memory Sliding-Window & Burst Rate Limiter (DDoS / Flood Shield)
// ============================================================================
interface RateEntry {
  timestamps: number[];
  burstTimestamps: number[];
  blockedUntil: number;
  violations: number;
}

interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  burstWindowMs: number;
  maxBurst: number;
  cooldownMs: number;
  maxTrackedIps: number;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim().slice(0, 64);
  }
  return (req.ip || req.socket.remoteAddress || 'unknown').slice(0, 64);
}

function createRateLimiter(options: RateLimiterOptions) {
  const store = new Map<string, RateEntry>();

  // Periodic cleanup to keep memory bounded even under spoofed IP floods
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
      const latest = entry.timestamps[entry.timestamps.length - 1] ?? 0;
      if (now - latest > options.windowMs * 2 && entry.blockedUntil < now) {
        store.delete(ip);
      }
    }
  }, 30_000);
  cleanupTimer.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const ip = getClientIp(req);

    // Evict oldest entry if tracking table hits cap (prevents OOM attacks)
    if (!store.has(ip) && store.size >= options.maxTrackedIps) {
      const oldestKey = store.keys().next().value;
      if (oldestKey) {
        store.delete(oldestKey);
      }
    }

    let entry = store.get(ip);
    if (!entry) {
      entry = { timestamps: [], burstTimestamps: [], blockedUntil: 0, violations: 0 };
      store.set(ip, entry);
    }

    if (entry.blockedUntil > now) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.status(429).json({
        ok: false,
        code: 'COOLDOWN_ACTIVE',
        error: `Çok fazla ardışık istek algılandı. Kalkan ${retryAfterSec} saniye bekleme uyguluyor.`,
        retryAfterSec,
        remaining: 0,
        limit: options.maxRequests,
      });
      return;
    }

    // Prune expired timestamps outside sliding windows
    const windowStart = now - options.windowMs;
    const burstStart = now - options.burstWindowMs;
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
    entry.burstTimestamps = entry.burstTimestamps.filter((t) => t > burstStart);

    const overWindow = entry.timestamps.length >= options.maxRequests;
    const overBurst = entry.burstTimestamps.length >= options.maxBurst;

    if (overWindow || overBurst) {
      entry.violations += 1;
      const multiplier = Math.min(entry.violations, 3);
      const blockDuration = overBurst ? options.cooldownMs * multiplier : options.windowMs / 2;
      entry.blockedUntil = now + blockDuration;
      const retryAfterSec = Math.max(1, Math.ceil(blockDuration / 1000));

      res.setHeader('Retry-After', String(retryAfterSec));
      res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.status(429).json({
        ok: false,
        code: overBurst ? 'BURST_LIMIT_EXCEEDED' : 'RATE_LIMIT_EXCEEDED',
        error: overBurst
          ? `Ani istek taşkını durduruldu (4 sn içinde en fazla ${options.maxBurst} istek).`
          : `Dakikalık istek kotası aşıldı (${options.maxRequests} istek/dk).`,
        retryAfterSec,
        remaining: 0,
        limit: options.maxRequests,
      });
      return;
    }

    entry.timestamps.push(now);
    entry.burstTimestamps.push(now);

    const remaining = Math.max(0, options.maxRequests - entry.timestamps.length);
    res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Window-Sec', String(Math.round(options.windowMs / 1000)));
    next();
  };
}

// ============================================================================
// Input Sanitization & Validation Helpers
// ============================================================================
function sanitizeText(raw: unknown, maxLength: number): string {
  if (typeof raw !== 'string') {
    return '';
  }
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

interface FormulaCheckItem {
  key: 'rol' | 'gorev' | 'prompt';
  label: string;
  passed: boolean;
  note: string;
}

function evaluateFormulaPayload(rol: string, gorev: string, prompt: string) {
  const checks: FormulaCheckItem[] = [];

  const hasRoleKeyword =
    rol.length >= 12 &&
    /(geliştirici|tasarımcı|mühendis|eğitmen|mentor|mimar|uzman|asistan|öğretmen|editör|analist|sen )/i.test(
      rol
    );
  checks.push({
    key: 'rol',
    label: 'Rol Tanımı',
    passed: hasRoleKeyword,
    note: hasRoleKeyword
      ? 'Yapay zekâya net bir uzmanlık şapkası ve bakış açısı verilmiş.'
      : 'Rol kısmında uzmanlık alanını netleştir (ör. "Deneyimli bir frontend eğitmenisin").',
  });

  const hasTaskAction =
    gorev.length >= 16 &&
    /(oluştur|tasarla|yaz|kur|hazırla|geliştir|çöz|özetle|dönüştür|ekle|yap)/i.test(gorev);
  checks.push({
    key: 'gorev',
    label: 'Somut Görev',
    passed: hasTaskAction,
    note: hasTaskAction
      ? 'Teslim edilecek ürün veya çıktı net bir eylem fiiliyle belirtilmiş.'
      : 'Görev bölümüne net bir fiil ve çıktı ekle (ör. "tek sayfalık ders takip aracı kur").',
  });

  const hasConstraints =
    prompt.length >= 24 &&
    /(mobil|renk|hızlı|sade|güven|kasma|doğrula|türkçe|tek|adım|örnek|kısıt|stil|tasarım|minimal|responsive|buton|liste)/i.test(
      prompt
    );
  checks.push({
    key: 'prompt',
    label: 'Kısıt ve Bağlam (Prompt)',
    passed: hasConstraints,
    note: hasConstraints
      ? 'Tasarım, dil veya güvenlik kısıtları verildiği için sonuç çok daha isabetli çıkar.'
      : 'Prompt bölümüne en az iki kısıt ekle: hedef kitle, tasarım dili, hız veya güvenlik kuralı.',
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const status =
    passedCount === 3
      ? 'Hazır ve Net Formül'
      : passedCount === 2
        ? 'İyi Başlangıç, Küçük Eksik Var'
        : 'Geliştirilebilir Taslak';

  const assembledPrompt = [
    `[ROL]: ${rol || 'Sen öğrenci projelerine rehberlik eden kıdemli bir web geliştiricisisin.'}`,
    `[GÖREV]: ${gorev || 'Belirtilen öğrenci ihtiyacını çözen sade ve çalışan bir web arayüzü oluştur.'}`,
    `[PROMPT & KISITLAR]: ${prompt || 'Türkçe arayüz kullan, mobil uyumlu olsun, gereksiz animasyon ekleme ve kullanıcı girdilerini doğrula.'}`,
  ].join('\n\n');

  return {
    status,
    passedCount,
    totalChecks: checks.length,
    checks,
    assembledPrompt,
  };
}

// ============================================================================
// Express App Setup
// ============================================================================
async function startServer() {
  const app = express();

  // Trust first proxy (Cloud Run / load balancer) for accurate IP rate limiting
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Strict security headers on all responses (iframe-compatible CSP)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    if (IS_PROD) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https://i.ytimg.com",
        "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
        "connect-src 'self' ws: wss:",
        "object-src 'none'",
        "base-uri 'self'",
      ].join('; ')
    );
    next();
  });

  // Strict body size caps to block payload-exhaustion DoS attacks
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));

  // Handle malformed JSON payloads safely without crashing or leaking stack traces
  app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err && 'type' in err && (err as { type?: string }).type === 'entity.too.large') {
      res.status(413).json({
        ok: false,
        error: 'Gönderilen veri boyutu 16 KB güvenlik sınırını aştı.',
      });
      return;
    }
    if (err instanceof SyntaxError) {
      res.status(400).json({
        ok: false,
        error: 'Geçersiz JSON biçimi gönderildi.',
      });
      return;
    }
    next(err);
  });

  // Global flood guard for all non-asset routes
  const globalLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 240,
    burstWindowMs: 4_000,
    maxBurst: 60,
    cooldownMs: 10_000,
    maxTrackedIps: 5_000,
  });

  // Strict sliding-window + burst limiter for API routes
  const apiLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 20,
    burstWindowMs: 4_000,
    maxBurst: 4,
    cooldownMs: 15_000,
    maxTrackedIps: 5_000,
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/src/') || req.path.startsWith('/assets/')) {
      next();
      return;
    }
    globalLimiter(req, res, next);
  });

  // In-flight API concurrency guard to prevent event-loop saturation
  let activeApiRequests = 0;
  const MAX_CONCURRENT_API = 32;

  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    if (activeApiRequests >= MAX_CONCURRENT_API) {
      res.setHeader('Retry-After', '2');
      res.status(503).json({
        ok: false,
        error: 'Sunucu yoğunluk koruması devrede, lütfen 2 saniye sonra tekrar deneyin.',
      });
      return;
    }
    activeApiRequests += 1;
    res.on('finish', () => {
      activeApiRequests = Math.max(0, activeApiRequests - 1);
    });
    res.on('close', () => {
      activeApiRequests = Math.max(0, activeApiRequests - 1);
    });
    next();
  });

  app.use('/api', apiLimiter);

  // Health endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Formula evaluation endpoint (strictly validated & sanitized)
  app.post('/api/formula/evaluate', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ ok: false, error: 'Geçerli bir formül verisi gönderilmelidir.' });
      return;
    }

    const rol = sanitizeText(body.rol, 400);
    const gorev = sanitizeText(body.gorev, 500);
    const prompt = sanitizeText(body.prompt, 900);

    if (!rol && !gorev && !prompt) {
      res.status(400).json({
        ok: false,
        error: 'Değerlendirme için en az bir alan doldurulmalıdır.',
      });
      return;
    }

    const evaluation = evaluateFormulaPayload(rol, gorev, prompt);
    res.json({
      ok: true,
      evaluation,
      quotaRemaining: Number(res.getHeader('X-RateLimit-Remaining') ?? 0),
    });
  });

  // Real rate-limiter probe endpoint for student verification
  app.post('/api/security/probe', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      message: 'İstek güvenlik katmanından onay aldı.',
      remaining: Number(res.getHeader('X-RateLimit-Remaining') ?? 0),
      limit: Number(res.getHeader('X-RateLimit-Limit') ?? 20),
      timestamp: new Date().toISOString(),
    });
  });

  // Catch-all for unknown API routes
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ ok: false, error: 'İstenen API uç noktası bulunamadı.' });
  });

  // Vite integration in development, static dist in production
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        etag: true,
      })
    );
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Node HTTP server with Slowloris and connection exhaustion timeouts
  const server = http.createServer(app);
  server.requestTimeout = 10_000;
  server.headersTimeout = 5_000;
  server.keepAliveTimeout = 5_000;

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Kampüs WipeCode sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
  });
}

startServer().catch((err) => {
  console.error('Sunucu başlatılırken hata oluştu:', err);
  process.exit(1);
});
