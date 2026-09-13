import {
  type Env,
  buildVisit,
  ipAllowed,
  logVisit,
  shouldSkipLogging,
} from './_lib/hq';
import {
  isAllowedPublicPath,
  isJunkUserAgent,
  isProbePath,
  isSearchBot,
} from './_lib/allowlist';

type Context = {
  request: Request;
  next: () => Promise<Response>;
  env: Env;
  waitUntil: (p: Promise<unknown>) => void;
};

function hard404(): Response {
  return new Response(
    `<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>404 — Hazher</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#070b10;color:#c9d4e0;font-family:system-ui,sans-serif}a{color:#3dd68c}</style></head><body><div style="text-align:center"><p style="font-size:2rem;margin:0 0 8px;font-weight:700">404</p><p style="opacity:.7;margin:0 0 18px">Siden finnes ikke.</p><a href="/">Til hazher.no</a></div></body></html>`,
    {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    },
  );
}

export async function onRequest(context: Context): Promise<Response> {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const ua = context.request.headers.get('User-Agent') || '';

  const isHq =
    path === '/hq' ||
    path.startsWith('/hq/') ||
    path === '/api/hq' ||
    path.startsWith('/api/hq/');

  if (isHq && !ipAllowed(context.request, context.env)) {
    return hard404();
  }

  // Block scanner junk before it hits static hosting / SPA fallback
  if (!isHq && !isAllowedPublicPath(path)) {
    return hard404();
  }

  if (
    context.request.method === 'GET' &&
    !shouldSkipLogging(path) &&
    !isProbePath(path) &&
    isAllowedPublicPath(path) &&
    !isJunkUserAgent(ua)
  ) {
    // Still log Google/Bing so you see real crawlers; skip junk bots
    const visit = buildVisit(context.request);
    if (isSearchBot(ua)) {
      visit.device = 'Søkemotor';
    }
    context.waitUntil(logVisit(context.env, visit));
  }

  return context.next();
}
