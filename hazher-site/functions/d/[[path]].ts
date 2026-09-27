type Env = {
  DYREHJELPEN_SUPABASE_URL?: string;
  DYREHJELPEN_SUPABASE_ANON_KEY?: string;
};

type PagesContext = {
  params: { path?: string | string[] };
  request: Request;
  env?: Env;
};

const DEFAULT_URL = 'https://zsrghcpgwngzffhiatif.supabase.co';
/** Public anon key (same as mobile app) — RLS must keep unpublished private. */
const DEFAULT_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcmdoY3Bnd25nemZmaGlhdGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MTYwMDUsImV4cCI6MjEwNTk5MjAwNX0.HXPIcDf_WkKrY5mTfQO36jJLygo6HUZ-Z8I77aMg4kI';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function firstImage(row: Record<string, unknown>): string | null {
  const images = row.images;
  if (Array.isArray(images) && images.length > 0) {
    const u = String(images[0] ?? '');
    if (u) return u;
  }
  const meta = row.metadata;
  if (meta && typeof meta === 'object') {
    const videos = (meta as Record<string, unknown>).videos;
    if (Array.isArray(videos) && videos.length > 0) {
      // Video-only posts: use brand fallback for OG image
      return null;
    }
  }
  return null;
}

function typeLabel(t: string): string {
  const map: Record<string, string> = {
    opplevelse: 'Opplevelse',
    savnet: 'Savnet',
    funnet: 'Funnet',
    observert: 'Observert',
    akutt: 'Akutt',
    sporsmal: 'Spørsmål',
    tips: 'Tips',
    omplassering: 'Omplassering',
    spleis: 'Spleis',
  };
  return map[t] || t || 'Sak';
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const raw = context.params.path;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response('Not found', { status: 404 });
  }

  const host = new URL(context.request.url).host;
  const canonical = `https://${host}/d/${id}`;
  const supabaseUrl =
    context.env?.DYREHJELPEN_SUPABASE_URL?.trim() || DEFAULT_URL;
  const anon =
    context.env?.DYREHJELPEN_SUPABASE_ANON_KEY?.trim() || DEFAULT_ANON;

  const qs = new URLSearchParams({
    id: `eq.${id}`,
    publication_status: 'eq.published',
    select: 'id,title,description,images,listing_type,neighborhood_name,metadata,status',
    limit: '1',
  });

  let row: Record<string, unknown> | null = null;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/listings?${qs}`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        Accept: 'application/json',
      },
    });
    if (res.ok) {
      const data = (await res.json()) as unknown;
      if (Array.isArray(data) && data.length > 0 && data[0]) {
        row = data[0] as Record<string, unknown>;
      }
    }
  } catch {
    // fall through to soft 404 page
  }

  const brandImage = 'https://www.hazher.no/images/dyrehjelpen/welcome.jpg';
  const title = row
    ? String(row.title || 'DyreHjelpen')
    : 'Fant ikke saken · DyreHjelpen';
  const type = row ? typeLabel(String(row.listing_type || '')) : '';
  const descRaw = row
    ? String(row.description || '').trim()
    : 'Denne saken er ikke lenger synlig, eller lenken er ugyldig.';
  const area = row?.neighborhood_name
    ? String(row.neighborhood_name)
    : '';
  const description = [
    type,
    descRaw.slice(0, 180),
    area ? `Område: ${area}` : '',
  ]
    .filter(Boolean)
    .join(' — ');
  const image = (row && firstImage(row)) || brandImage;
  const appDeepLink = `dyrehjelpen://listing/${id}`;

  const html = `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)} · DyreHjelpen</title>
<meta name="description" content="${esc(description)}"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="DyreHjelpen"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${esc(canonical)}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:locale" content="nb_NO"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(description)}"/>
<meta name="twitter:image" content="${esc(image)}"/>
<link rel="canonical" href="${esc(canonical)}"/>
<style>
  :root { --forest:#1F4D3A; --moss:#DCE8DF; --ink:#14261E; --muted:#5C6B61; }
  *{box-sizing:border-box}
  body{margin:0;font-family:Georgia,"Iowan Old Style",serif;background:linear-gradient(165deg,#f3f7f4 0%,#e7efe9 45%,#f7f4ef 100%);color:var(--ink);min-height:100vh}
  .wrap{max-width:720px;margin:0 auto;padding:28px 20px 48px}
  .brand{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--forest);font-weight:700;font-family:system-ui,sans-serif}
  h1{font-size:clamp(1.7rem,4vw,2.35rem);line-height:1.15;margin:10px 0 8px;font-weight:700}
  .meta{color:var(--muted);font-family:system-ui,sans-serif;font-size:14px;margin-bottom:18px}
  .hero{width:100%;border-radius:18px;overflow:hidden;aspect-ratio:16/10;background:var(--moss);margin:0 0 18px}
  .hero img{width:100%;height:100%;object-fit:cover;display:block}
  .body{font-size:1.08rem;line-height:1.55;white-space:pre-wrap}
  .cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
  .btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 18px;border-radius:14px;text-decoration:none;font-family:system-ui,sans-serif;font-weight:700;font-size:15px}
  .primary{background:var(--forest);color:#fff}
  .ghost{background:#fff;color:var(--forest);border:1px solid #c5d6cb}
  footer{margin-top:36px;font-family:system-ui,sans-serif;font-size:13px;color:var(--muted)}
</style>
</head>
<body>
  <main class="wrap">
    <div class="brand">DyreHjelpen</div>
    <h1>${esc(title)}</h1>
    <div class="meta">${esc([type, area].filter(Boolean).join(' · ') || 'Delt via DyreHjelpen')}</div>
    <figure class="hero"><img src="${esc(image)}" alt=""/></figure>
    <div class="body">${esc(descRaw || '')}</div>
    <div class="cta">
      <a class="btn primary" href="${esc(appDeepLink)}">Åpne i DyreHjelpen</a>
      <a class="btn ghost" href="https://dyrehjelpen.no/">Om DyreHjelpen</a>
    </div>
    <footer>Deling fra DyreHjelpen — nabolaget for dyr. Lenke: ${esc(canonical)}</footer>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: row ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120',
    },
  });
}
