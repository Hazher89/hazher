/** Shared HQ helpers for hazher.no private admin. */

export type Env = {
  HAZHER_HQ?: KVNamespace;
  HQ_ALLOWED_IPS?: string;
  HQ_USER?: string;
  HQ_PASS_SALT?: string;
  HQ_PASS_HASH?: string;
  HQ_SESSION_SECRET?: string;
};

/** Defaults — override in Cloudflare Pages → Settings → Environment variables. */
export const HQ_DEFAULTS = {
  user: 'HAZHER',
  // PBKDF2-SHA256, 120000 iterations, 32 bytes — not the plaintext password
  passSalt: '187f793babfa6398e292a3fd20916a7b',
  passHash: '7062b3de907583bcd43dbf3852418b64722cfada2ef5b92e47132654c9b6edeb',
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

  if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && /Mobile/i.test(ua))) {
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

  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) {
    const m = ua.match(/OS (\d+[_\d]*)/);
    os = m ? `iOS ${m[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/Android/i.test(ua)) {
    const m = ua.match(/Android (\d+[.\d]*)/);
    os = m ? `Android ${m[1]}` : 'Android';
  } else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';

  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';

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
    ua: ua.slice(0, 280),
    referer: (request.headers.get('Referer') || '').slice(0, 300),
    language: (request.headers.get('Accept-Language') || '').slice(0, 80),
  };
}

export async function logVisit(env: Env, visit: VisitEvent): Promise<void> {
  const kv = env.HAZHER_HQ;
  if (!kv) return;

  const day = visit.ts.slice(0, 10);
  const key = `visits:${day}`;
  try {
    const raw = await kv.get(key);
    const list: VisitEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(visit);
    const trimmed = list.slice(0, 800);
    await kv.put(key, JSON.stringify(trimmed), { expirationTtl: 60 * 60 * 24 * 45 });

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
  return out.slice(0, limit);
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

async function pbkdf2Hex(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
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
  const salt = env.HQ_PASS_SALT || HQ_DEFAULTS.passSalt;
  const expected = env.HQ_PASS_HASH || HQ_DEFAULTS.passHash;
  const got = await pbkdf2Hex(password, salt);
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
