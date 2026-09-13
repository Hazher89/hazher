/** Public path allowlist — unknown routes get hard 404 (stops scanner noise). */

const PRODUCT_PAGES: Record<string, ReadonlySet<string>> = {
  DRIFTPRO: new Set(['', 'Privacy', 'Terms', 'Support']),
  CHRONOBLADE: new Set(['', 'Privacy', 'Terms', 'Support']),
  HURTIGHJELP: new Set(['', 'Privacy', 'Support', 'app']),
  KAPRE: new Set(['', 'Privacy', 'Terms', 'Support']),
  LOOPMARKED: new Set(['']),
  ALIBARBER: new Set(['', 'Privacy', 'Support', 'Delete']),
  DELELADER: new Set(['', 'Privacy', 'Terms', 'Support']),
  ECOSHELF: new Set(['', 'Privacy', 'Terms', 'Support']),
  NAVNISHAN: new Set(['', 'Privacy', 'Terms', 'Support']),
};

const ROOT_HTML = new Set([
  '',
  'index.html',
  'privacy.html',
  'privacy',
]);

const ROOT_FILES = new Set([
  'ads.txt',
  'app-ads.txt',
  'apple-app-site-association',
  'robots.txt',
  'favicon.ico',
  'favicon.png',
  'sitemap.xml',
]);

const ASSET_RE =
  /\.(css|js|map|mjs|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|txt|xml|json|webmanifest|mp4|webm)$/i;

const PROBE_RE =
  /(?:^|\/)(?:wp-admin|wp-login|wp-content|wp-includes|xmlrpc\.php|phpmyadmin|\.env|\.git|cgi-bin|vendor\/php|composer\.(?:json|lock)|node_modules|admin\.php|eval-stdin|actuator)(?:\/|$)/i;

export function normalizePath(pathname: string): string {
  let p = pathname || '/';
  try {
    p = decodeURIComponent(p);
  } catch {
    // keep raw
  }
  p = p.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

export function isAssetPath(pathname: string): boolean {
  return ASSET_RE.test(pathname);
}

export function isProbePath(pathname: string): boolean {
  if (PROBE_RE.test(pathname)) return true;
  if (pathname.length > 180) return true;
  if ((pathname.match(/\//g) || []).length > 8) return true;
  // Mixed product hubs in one URL = scanner noise
  const upper = pathname.toUpperCase();
  let hits = 0;
  for (const hub of Object.keys(PRODUCT_PAGES)) {
    if (upper.includes(`/${hub}/`) || upper.endsWith(`/${hub}`)) hits += 1;
    if (hits >= 2) return true;
  }
  return false;
}

export function isAllowedPublicPath(pathname: string): boolean {
  const raw = pathname || '/';
  if (isProbePath(raw)) return false;

  const p = normalizePath(raw);

  if (p === '/hq' || p.startsWith('/hq/')) return true;
  if (p === '/api/hq' || p.startsWith('/api/hq/')) return true;
  if (p === '/j' || p.startsWith('/j/')) return true;
  if (p === '/u' || p.startsWith('/u/')) return true;
  if (p.startsWith('/HURTIGHJELP/j') || p.startsWith('/HURTIGHJELP/u')) return true;
  if (p.startsWith('/.well-known/')) return true;
  if (p === '/images' || p.startsWith('/images/')) return true;
  if (p.startsWith('/cdn-cgi/')) return true;

  // Static assets anywhere under site (css/js/images next to hubs)
  if (isAssetPath(p)) return true;

  const parts = p.split('/').filter(Boolean);
  if (parts.length === 0) return true;

  const first = parts[0];

  if (parts.length === 1) {
    const low = first.toLowerCase();
    if (ROOT_HTML.has(low) || ROOT_HTML.has(first)) return true;
    if (ROOT_FILES.has(low) || ROOT_FILES.has(first)) return true;
    // lowercase product aliases handled by _redirects; allow them through
    if (PRODUCT_PAGES[first.toUpperCase()]) return true;
    const aliases = [
      'driftpro',
      'kapre',
      'alibarber',
      'ecoshelf',
      'navnishan',
      'chronoblade',
      'chrono-blade',
      'hurtighjelp',
      'loopmarked',
      'delelader',
      'listing',
      'l',
    ];
    if (aliases.includes(low)) return true;
    return false;
  }

  // /listing/* /l/* → KAPRE redirects
  if (first === 'listing' || first === 'l' || first === 'KAPRE' && parts[1] === 'l') {
    return true;
  }

  // Lowercase alias trees (redirects) — shallow only
  const lowFirst = first.toLowerCase();
  const aliasMap: Record<string, string> = {
    driftpro: 'DRIFTPRO',
    kapre: 'KAPRE',
    alibarber: 'ALIBARBER',
    ecoshelf: 'ECOSHELF',
    navnishan: 'NAVNISHAN',
    chronoblade: 'CHRONOBLADE',
    'chrono-blade': 'CHRONOBLADE',
    hurtighjelp: 'HURTIGHJELP',
    loopmarked: 'LOOPMARKED',
    delelader: 'DELELADER',
  };
  const hub = PRODUCT_PAGES[first] ? first : aliasMap[lowFirst];
  if (!hub || !PRODUCT_PAGES[hub]) return false;

  const allowed = PRODUCT_PAGES[hub];
  if (parts.length === 1) return true;
  if (parts.length === 2) {
    const page = parts[1];
    const pageAliases: Record<string, string> = {
      personvern: 'Privacy',
      privacy: 'Privacy',
      vilkar: 'Terms',
      terms: 'Terms',
      support: 'Support',
      delete: 'Delete',
      app: 'app',
    };
    const mapped = pageAliases[page.toLowerCase()];
    if (mapped) return allowed.has(mapped);
    return allowed.has(page);
  }

  // /HURTIGHJELP/app only (assets under it already allowed via extension)
  if (hub === 'HURTIGHJELP' && parts[1] === 'app' && parts.length === 2) return true;

  return false;
}

/** Aggressive scrapers/scanners — still may hit real pages; we 404 junk paths separately. */
export function isJunkUserAgent(uaRaw: string): boolean {
  const ua = uaRaw || '';
  if (!ua || ua.length < 12) return true;
  return /(?:curl|wget|python-requests|python-urllib|scrapy|httpclient|go-http|java\/|libwww|scrapy|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|ccbot|dataforseo|masscan|zgrab|nuclei|sqlmap|nikto|dirbuster|gobuster|fuzz|attack)/i.test(
    ua,
  );
}

export function isSearchBot(uaRaw: string): boolean {
  return /googlebot|bingbot|applebot|duckduckbot|yandexbot|baiduspider/i.test(uaRaw || '');
}
