/** Shared HQ helpers for hazher.no private admin. */

import { isAllowedPublicPath, isJunkUserAgent, isProbePath } from './allowlist';

export type Env = {
  HAZHER_HQ?: KVNamespace;
  HQ_ALLOWED_IPS?: string;
  HQ_USER?: string;
  HQ_PASS?: string;
  HQ_PASS_SALT?: string;
  HQ_PASS_HASH?: string;
  HQ_SESSION_SECRET?: string;
};

/** Defaults — override in Cloudflare Pages → Settings → Environment variables. */
export const HQ_DEFAULTS = {
  user: 'HAZHER',
  // sha256(`${password}:${salt}`) — Workers-friendly (PBKDF2 120k caused 1101 CPU kills)
  passSalt: '187f793babfa6398e292a3fd20916a7b',
  passHash: '533748687f14b01a8353db83e2f180c48468e403b3d4c82b3acdb36a2bc9c27f',
};

export type VisitEvent = {
  id: string;
  ts: string;
  path: string;
  method: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  continent: string;
  colo: string;
  asn: string;
  isp: string;
  lat: string;
  lon: string;
  timezone: string;
  device: string;
  os: string;
  browser: string;
  ua: string;
  referer: string;
  language: string;
};

export function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    ''
  );
}

export function ipAllowed(request: Request, env: Env): boolean {
  const raw = (env.HQ_ALLOWED_IPS || '').trim();
  if (!raw) return false;
  const ip = clientIp(request);
  if (!ip) return false;
  const allowed = raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  return allowed.includes(ip);
}

export function parseDevice(uaRaw: string): { device: string; os: string; browser: string } {
  const ua = uaRaw || '';
  let device = 'Desktop';
  let os = 'Ukjent';
  let browser = 'Ukjent';

  if (/bot|crawler|spider|slurp|facebookexternalhit|preview|wget|curl|python-requests|httpclient|scrapy|semrush|ahrefs|bingpreview/i.test(ua)) {
    device = 'Bot / crawler';
  } else if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && /Mobile/i.test(ua))) {
    device = 'iPad';
  } else if (/iPhone/i.test(ua)) {
    device = 'iPhone';
  } else if (/Android/i.test(ua) && /Mobile/i.test(ua)) {
    device = 'Android telefon';
  } else if (/Android/i.test(ua)) {
    device = 'Android nettbrett';
  } else if (/Mobile|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)) {
    device = 'Mobil';
  }

  if (/Windows NT 10/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua) && !/iPhone|iPad/i.test(ua)) {
    const m = ua.match(/Mac OS X (\d+[_\d]*)/);
    os = m ? `macOS ${m[1].replace(/_/g, '.')}` : 'macOS';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    const m = ua.match(/OS (\d+[_\d]*)/);
    os = m ? `iOS ${m[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/Android/i.test(ua)) {
    const m = ua.match(/Android (\d+[.\d]*)/);
    os = m ? `Android ${m[1]}` : 'Android';
  } else if (/CrOS/i.test(ua)) os = 'ChromeOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  if (/Edg\//i.test(ua)) {
    const m = ua.match(/Edg\/([\d.]+)/);
    browser = m ? `Edge ${m[1]}` : 'Edge';
  } else if (/OPR\/|Opera/i.test(ua)) {
    const m = ua.match(/OPR\/([\d.]+)/);
    browser = m ? `Opera ${m[1]}` : 'Opera';
  } else if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
    const m = ua.match(/SamsungBrowser\/([\d.]+)/i);
    browser = m ? `Samsung ${m[1]}` : 'Samsung Internet';
  } else if (/Chrome\/([\d.]+)/i.test(ua) && !/Edg\//i.test(ua)) {
    const m = ua.match(/Chrome\/([\d.]+)/i);
    browser = m ? `Chrome ${m[1]}` : 'Chrome';
  } else if (/Firefox\/([\d.]+)/i.test(ua)) {
    const m = ua.match(/Firefox\/([\d.]+)/i);
    browser = m ? `Firefox ${m[1]}` : 'Firefox';
  } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    const m = ua.match(/Version\/([\d.]+)/);
    browser = m ? `Safari ${m[1]}` : 'Safari';
  } else if (/bot|crawler|spider/i.test(ua)) {
    browser = 'Crawler';
  }

  return { device, os, browser };
}

export function buildVisit(request: Request): VisitEvent {
  const url = new URL(request.url);
  const cf = (request as Request & { cf?: CfProperties }).cf;
  const ua = request.headers.get('User-Agent') || '';
  const parsed = parseDevice(ua);
  const id = crypto.randomUUID();

  return {
    id,
    ts: new Date().toISOString(),
    path: url.pathname + url.search,
    method: request.method,
    ip: clientIp(request),
    country: String(cf?.country || ''),
    city: String(cf?.city || ''),
    region: String(cf?.region || cf?.regionCode || ''),
    continent: String(cf?.continent || ''),
    colo: String(cf?.colo || ''),
    asn: cf?.asn != null ? String(cf.asn) : '',
    isp: String(cf?.asOrganization || ''),
    lat: cf?.latitude != null ? String(cf.latitude) : '',
    lon: cf?.longitude != null ? String(cf.longitude) : '',
    timezone: String(cf?.timezone || ''),
    device: parsed.device,
    os: parsed.os,
    browser: parsed.browser,
    ua: ua.slice(0, 420),
    referer: (request.headers.get('Referer') || '').slice(0, 400),
    language: (request.headers.get('Accept-Language') || '').slice(0, 120),
  };
}

const RECENT_KEY = 'visits:recent';
const RECENT_LIMIT = 250;

function isNoiseVisit(v: VisitEvent): boolean {
  const path = v.path || '/';
  if (isProbePath(path) || !isAllowedPublicPath(path.split('?')[0] || '/')) return true;
  if (isJunkUserAgent(v.ua || '')) return true;
  if (/bot|crawler/i.test(v.device || '')) return true;
  return false;
}

export async function logVisit(env: Env, visit: VisitEvent): Promise<void> {
  const kv = env.HAZHER_HQ;
  if (!kv) return;

  const day = visit.ts.slice(0, 10);
  const dayKey = `visits:${day}`;
  try {
    // Fast ring buffer — one key for HQ feed (newest first)
    const recentRaw = await kv.get(RECENT_KEY);
    const recent: VisitEvent[] = recentRaw ? JSON.parse(recentRaw) : [];
    recent.unshift(visit);
    await kv.put(RECENT_KEY, JSON.stringify(recent.slice(0, RECENT_LIMIT)), {
      expirationTtl: 60 * 60 * 24 * 60,
    });

    const raw = await kv.get(dayKey);
    const list: VisitEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(visit);
    await kv.put(dayKey, JSON.stringify(list.slice(0, 800)), {
      expirationTtl: 60 * 60 * 24 * 45,
    });

    const indexRaw = await kv.get('visits:index');
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!index.includes(day)) {
      index.unshift(day);
      await kv.put('visits:index', JSON.stringify(index.slice(0, 45)));
    }
  } catch {
    // never break the site for logging
  }
}

export async function loadRecentVisits(env: Env, limit = 200): Promise<VisitEvent[]> {
  const kv = env.HAZHER_HQ;
  if (!kv) return [];
  try {
    const raw = await kv.get(RECENT_KEY);
    if (raw) {
      const list: VisitEvent[] = JSON.parse(raw);
      return list
        .filter((v) => !isNoiseVisit(v))
        .sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
        .slice(0, limit);
    }
  } catch {
    // fall through
  }
  const fallback = await loadVisits(env, 21, limit);
  if (fallback.length) {
    try {
      await kv.put(RECENT_KEY, JSON.stringify(fallback.slice(0, RECENT_LIMIT)), {
        expirationTtl: 60 * 60 * 24 * 60,
      });
    } catch {
      // ignore seed failure
    }
  }
  return fallback.filter((v) => !isNoiseVisit(v));
}

export async function loadVisits(env: Env, days = 14, limit = 400): Promise<VisitEvent[]> {
  const kv = env.HAZHER_HQ;
  if (!kv) return [];
  const indexRaw = await kv.get('visits:index');
  const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
  const out: VisitEvent[] = [];
  for (const day of index.slice(0, days)) {
    const raw = await kv.get(`visits:${day}`);
    if (!raw) continue;
    const list: VisitEvent[] = JSON.parse(raw);
    out.push(...list);
    if (out.length >= limit) break;
  }
  return out
    .sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
    .slice(0, limit);
}

export function summarizeVisits(visits: VisitEvent[]) {
  const byCountry: Record<string, number> = {};
  const byDevice: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const byBrowser: Record<string, number> = {};
  const byOs: Record<string, number> = {};
  const byIsp: Record<string, number> = {};

  for (const v of visits) {
    const c = v.country || '??';
    byCountry[c] = (byCountry[c] || 0) + 1;
    byDevice[v.device || 'Ukjent'] = (byDevice[v.device || 'Ukjent'] || 0) + 1;
    byBrowser[v.browser || 'Ukjent'] = (byBrowser[v.browser || 'Ukjent'] || 0) + 1;
    byOs[v.os || 'Ukjent'] = (byOs[v.os || 'Ukjent'] || 0) + 1;
    if (v.isp) byIsp[v.isp] = (byIsp[v.isp] || 0) + 1;
    const path = (v.path || '/').split('?')[0] || '/';
    byPath[path] = (byPath[path] || 0) + 1;
    const day = (v.ts || '').slice(0, 10);
    if (day) byDay[day] = (byDay[day] || 0) + 1;
  }

  const sortEntries = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]);

  return {
    total: visits.length,
    countries: sortEntries(byCountry).slice(0, 20),
    devices: sortEntries(byDevice),
    browsers: sortEntries(byBrowser),
    os: sortEntries(byOs),
    isps: sortEntries(byIsp).slice(0, 12),
    paths: sortEntries(byPath).slice(0, 25),
    days: sortEntries(byDay).slice(0, 30),
  };
}

export function shouldSkipLogging(pathname: string): boolean {
  if (pathname.startsWith('/hq')) return true;
  if (pathname.startsWith('/api/hq')) return true;
  if (pathname.startsWith('/cdn-cgi')) return true;
  if (/\.(css|js|map|png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|txt|xml)$/i.test(pathname)) {
    return true;
  }
  return false;
}

async function passwordHashHex(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const bytes = await crypto.subtle.digest('SHA-256', enc.encode(`${password}:${salt}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyHqLogin(
  env: Env,
  username: string,
  password: string,
): Promise<boolean> {
  const user = (env.HQ_USER || HQ_DEFAULTS.user).trim();
  if (username.trim() !== user) return false;

  // Optional plain secret for emergency override (Cloudflare Secrets only)
  if (env.HQ_PASS && password === env.HQ_PASS) return true;

  const salt = env.HQ_PASS_SALT || HQ_DEFAULTS.passSalt;
  const expected = env.HQ_PASS_HASH || HQ_DEFAULTS.passHash;
  const got = await passwordHashHex(password, salt);
  return timingSafeEqual(got, expected);
}

async function hmacSign(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(env: Env, username: string): Promise<string> {
  const secret = env.HQ_SESSION_SECRET || env.HQ_PASS_HASH || HQ_DEFAULTS.passHash;
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = `${username}|${exp}`;
  const sig = await hmacSign(secret, payload);
  return `${btoa(payload)}.${sig}`;
}

export async function readSession(
  request: Request,
  env: Env,
): Promise<{ user: string } | null> {
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)hq_session=([^;]+)/);
  if (!m) return null;
  try {
    const raw = decodeURIComponent(m[1]);
    const [payloadB64, sig] = raw.split('.');
    if (!payloadB64 || !sig) return null;
    const payload = atob(payloadB64);
    const secret = env.HQ_SESSION_SECRET || env.HQ_PASS_HASH || HQ_DEFAULTS.passHash;
    const expect = await hmacSign(secret, payload);
    if (!timingSafeEqual(sig, expect)) return null;
    const [user, expStr] = payload.split('|');
    if (!user || Date.now() > Number(expStr)) return null;
    return { user };
  } catch {
    return null;
  }
}

export function sessionCookie(token: string, clear = false): string {
  if (clear) {
    return 'hq_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
  }
  return `hq_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`;
}

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function notFound(): Response {
  return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
}
