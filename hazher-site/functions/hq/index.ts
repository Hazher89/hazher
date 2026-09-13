import {
  type Env,
  type VisitEvent,
  clientIp,
  ipAllowed,
  loadRecentVisits,
  notFound,
  readSession,
  summarizeVisits,
} from '../_lib/hq';

type Ctx = { request: Request; env: Env };

export async function onRequestGet(context: Ctx): Promise<Response> {
  if (!ipAllowed(context.request, context.env)) return notFound();
  const session = await readSession(context.request, context.env);
  const ip = clientIp(context.request);

  let visits: VisitEvent[] = [];
  let kvConfigured = !!context.env.HAZHER_HQ;
  let kvMessage = '';
  if (session && context.env.HAZHER_HQ) {
    visits = await loadRecentVisits(context.env, 200);
  } else if (session && !context.env.HAZHER_HQ) {
    kvConfigured = false;
    kvMessage = 'KV-binding HAZHER_HQ mangler — besøk logges ikke.';
  }

  const html = renderHq({
    loggedIn: !!session,
    user: session?.user || null,
    ip,
    visits,
    kvConfigured,
    kvMessage,
  });
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function renderHq(opts: {
  loggedIn: boolean;
  user: string | null;
  ip: string;
  visits: VisitEvent[];
  kvConfigured: boolean;
  kvMessage: string;
}): string {
  const summary = summarizeVisits(opts.visits);
  const boot = {
    ok: true,
    kvConfigured: opts.kvConfigured,
    message: opts.kvMessage || undefined,
    visits: opts.visits,
    summary,
    fetchedAt: new Date().toISOString(),
  };
  const bootJson = JSON.stringify(boot).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Hazher HQ</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
:root{
  --bg:#05080c;
  --panel:#0c1219;
  --row:#101820;
  --line:rgba(255,255,255,.09);
  --text:#f2f5f8;
  --muted:#8b98a8;
  --dim:#667484;
  --accent:#2fd67b;
  --blue:#6ea8ff;
  --amber:#efb04a;
  --danger:#ff6b6b;
  --radius:14px;
}
*{box-sizing:border-box}
html,body{margin:0}
body{
  min-height:100vh;color:var(--text);
  font-family:"IBM Plex Sans",system-ui,sans-serif;
  background:
    radial-gradient(800px 360px at 8% -10%, rgba(47,214,123,.13), transparent 55%),
    radial-gradient(700px 320px at 100% 0%, rgba(110,168,255,.1), transparent 50%),
    var(--bg);
}
.shell{max-width:1120px;margin:0 auto;padding:20px 14px 64px}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:18px}
.brand{font-weight:700;letter-spacing:-.03em;font-size:1.35rem}
.brand span{color:var(--accent)}
.sub{color:var(--muted);font-size:.88rem;margin-top:3px}
.pill{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.03);font-size:.78rem;color:var(--muted);white-space:nowrap}
.pill b{color:var(--text);font-family:"IBM Plex Mono",monospace;font-weight:600}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:16px}
.login-wrap{max-width:400px;margin:10vh auto 0}
label{display:block;font-size:.84rem;color:var(--muted);margin:0 0 6px}
input{width:100%;padding:12px 13px;border-radius:11px;border:1px solid var(--line);background:#080d13;color:var(--text);font:inherit;margin-bottom:12px}
input:focus{outline:2px solid rgba(47,214,123,.28);border-color:var(--accent)}
button{appearance:none;border:0;border-radius:11px;padding:11px 14px;font:inherit;font-weight:600;cursor:pointer}
.btn{background:linear-gradient(135deg,var(--accent),#22b866);color:#04180e;width:100%}
.btn-ghost{background:rgba(255,255,255,.03);color:var(--muted);border:1px solid var(--line)}
.btn-ghost:hover{color:var(--text)}
.err{color:var(--danger);font-size:.9rem;min-height:1.2em;margin-bottom:8px}
.muted{color:var(--muted)}
.hidden{display:none!important}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
.live{display:inline-flex;align-items:center;gap:7px;font-size:.82rem;color:var(--muted)}
.dot{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 0 rgba(47,214,123,.55);animation:pulse 1.6s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(47,214,123,.45)}70%{box-shadow:0 0 0 8px rgba(47,214,123,0)}100%{box-shadow:0 0 0 0 rgba(47,214,123,0)}}
h2{margin:0;font-size:1rem;letter-spacing:-.02em}
.kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-bottom:14px}
.kpi{padding:12px 13px}
.kpi .l{font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:600}
.kpi .v{margin-top:6px;font-size:1.45rem;font-weight:700;letter-spacing:-.04em;line-height:1.1;word-break:break-word}
.feed-wrap{margin-bottom:14px}
.sec-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:12px}
.sec-head p{margin:0;font-size:.8rem;color:var(--muted)}
.feed{display:flex;flex-direction:column;gap:8px;max-height:min(78vh,900px);overflow:auto}
.visit{
  background:var(--row);border:1px solid var(--line);border-radius:12px;
  padding:12px 13px;display:grid;grid-template-columns:132px 1fr;gap:10px 14px;min-width:0
}
.visit.new{outline:1px solid rgba(47,214,123,.45);background:rgba(47,214,123,.05)}
.when{font-family:"IBM Plex Mono",monospace;font-size:.78rem;line-height:1.4}
.when .ago{display:block;color:var(--accent);font-weight:600;font-size:.84rem;margin-bottom:3px}
.when .abs{color:var(--muted)}
.main{min-width:0}
.where{font-size:1rem;font-weight:600;letter-spacing:-.015em;margin-bottom:6px;line-height:1.25}
.where .cc{color:var(--blue);font-weight:600}
.facts{
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px 14px;
  font-size:.8rem;line-height:1.35;margin-top:8px
}
.fact{min-width:0;display:flex;gap:7px}
.fact b{color:var(--dim);font-weight:500;flex:0 0 52px;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;padding-top:1px}
.fact span{min-width:0;overflow-wrap:anywhere;color:var(--text)}
.path{
  margin-top:8px;padding:7px 9px;border-radius:8px;background:rgba(0,0,0,.28);
  border:1px solid var(--line);font-family:"IBM Plex Mono",monospace;font-size:.76rem;
  color:#c9d4e0;overflow-wrap:anywhere;word-break:break-word
}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.chip{display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;font-size:.72rem;background:rgba(110,168,255,.12);color:#b9d2ff}
.chip.g{background:rgba(47,214,123,.12);color:#9aefc5}
.chip.o{background:rgba(239,176,74,.14);color:#ffd39a}
.chip.r{background:rgba(255,107,107,.12);color:#ffb0b0}
.ua{margin-top:7px;font-size:.7rem;color:var(--dim);font-family:"IBM Plex Mono",monospace;line-height:1.35;overflow-wrap:anywhere}
.charts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.charts .full{grid-column:1/-1}
.bars{display:flex;flex-direction:column;gap:10px}
.bar-item{display:flex;flex-direction:column;gap:5px;min-width:0}
.bar-meta{display:flex;justify-content:space-between;gap:10px;min-width:0}
.bar-label{font-size:.82rem;line-height:1.3;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-label.wrap{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.bar-n{font-family:"IBM Plex Mono",monospace;font-size:.74rem;color:var(--muted);flex-shrink:0}
.bar-track{height:6px;border-radius:99px;background:#080d13;overflow:hidden;border:1px solid var(--line)}
.bar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--blue),var(--accent))}
.empty{padding:26px 8px;text-align:center;color:var(--muted);font-size:.9rem}
@media(max-width:900px){
  .kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
  .facts{grid-template-columns:1fr}
  .visit{grid-template-columns:1fr}
}
@media(max-width:560px){
  .kpis,.charts{grid-template-columns:1fr}
  .top{flex-direction:column}
}
</style>
</head>
<body>
<div class="shell">
  <div class="top">
    <div>
      <div class="brand">Hazher <span>HQ</span></div>
      <div class="sub">Privat kontrollrom · live besøk · kun din IP</div>
    </div>
    <div class="pill">Din IP <b id="myIp">${escapeHtml(opts.ip || '—')}</b></div>
  </div>

  <section id="loginView" class="login-wrap panel ${opts.loggedIn ? 'hidden' : ''}">
    <h2>Logg inn</h2>
    <p class="muted" style="margin:8px 0 16px;font-size:.9rem">Usynlig for andre IP-adresser (404).</p>
    <div class="err" id="loginErr"></div>
    <label for="user">Bruker</label>
    <input id="user" autocomplete="username" spellcheck="false"/>
    <label for="pass">Passord</label>
    <input id="pass" type="password" autocomplete="current-password"/>
    <button class="btn" id="loginBtn" type="button">Gå inn</button>
  </section>

  <section id="dashView" class="${opts.loggedIn ? '' : 'hidden'}">
    <div class="toolbar">
      <button class="btn-ghost" id="refreshBtn" type="button">Oppdater nå</button>
      <button class="btn-ghost" id="logoutBtn" type="button">Logg ut</button>
      <span class="live"><span class="dot"></span><span id="statusLine">Live</span></span>
    </div>

    <div class="kpis">
      <div class="panel kpi"><div class="l">Besøk</div><div class="v" id="kTotal">—</div></div>
      <div class="panel kpi"><div class="l">Land</div><div class="v" id="kCountries">—</div></div>
      <div class="panel kpi"><div class="l">Enheter</div><div class="v" id="kDevices">—</div></div>
      <div class="panel kpi"><div class="l">ISP-er</div><div class="v" id="kIsps">—</div></div>
      <div class="panel kpi"><div class="l">Topp side</div><div class="v" id="kTopPath" style="font-size:.95rem">—</div></div>
    </div>

    <div class="panel feed-wrap">
      <div class="sec-head">
        <div>
          <h2>Siste besøkende</h2>
          <p>Ekte treff · når · hvor · enhet · IP · side — auto-oppdateres</p>
        </div>
        <span class="muted" id="feedCount" style="font-size:.8rem"></span>
      </div>
      <div class="feed" id="visitFeed"></div>
    </div>

    <div class="charts">
      <div class="panel"><div class="sec-head"><h2>Land</h2></div><div class="bars" id="countryBars"></div></div>
      <div class="panel"><div class="sec-head"><h2>Enheter</h2></div><div class="bars" id="deviceBars"></div></div>
      <div class="panel"><div class="sec-head"><h2>OS</h2></div><div class="bars" id="osBars"></div></div>
      <div class="panel"><div class="sec-head"><h2>Nettleser</h2></div><div class="bars" id="browserBars"></div></div>
      <div class="panel"><div class="sec-head"><h2>ISP / nett</h2></div><div class="bars" id="ispBars"></div></div>
      <div class="panel"><div class="sec-head"><h2>Dager</h2></div><div class="bars" id="dayBars"></div></div>
      <div class="panel full"><div class="sec-head"><h2>Sider</h2></div><div class="bars" id="pathBars"></div></div>
    </div>
  </section>
</div>
<script>
const loggedIn = ${opts.loggedIn ? 'true' : 'false'};
const BOOT = ${bootJson};
const $ = (id) => document.getElementById(id);
let knownIds = new Set();
let firstPaint = true;
let pollTimer = null;
let lastVisits = [];

async function login() {
  $('loginErr').textContent = '';
  const res = await fetch('/api/hq/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: $('user').value.trim(), password: $('pass').value }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    $('loginErr').textContent = data.error || ('Innlogging feilet (' + res.status + ')');
    return;
  }
  location.reload();
}

async function logout() {
  await fetch('/api/hq/logout', { method: 'POST' });
  location.reload();
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function barList(el, rows, maxN = 8, wrap = false) {
  if (!rows || !rows.length) {
    el.innerHTML = '<div class="empty">Ingen data</div>';
    return;
  }
  const slice = rows.slice(0, maxN);
  const max = Math.max(1, ...slice.map((r) => r[1]));
  el.innerHTML = slice.map(([label, n]) => {
    const pct = Math.round((n / max) * 100);
    const title = esc(label || '—');
    return \`<div class="bar-item"><div class="bar-meta"><div class="bar-label\${wrap ? ' wrap' : ''}" title="\${title}">\${title}</div><div class="bar-n">\${n}</div></div><div class="bar-track"><div class="bar-fill" style="width:\${pct}%"></div></div></div>\`;
  }).join('');
}

function relTime(iso) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '—';
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 5) return 'nå';
  if (s < 60) return s + ' sek siden';
  const m = Math.floor(s / 60);
  if (m < 60) return m + ' min siden';
  const h = Math.floor(m / 60);
  if (h < 48) return h + ' t siden';
  return Math.floor(h / 24) + ' d siden';
}

function absTime(iso) {
  try {
    return new Date(iso).toLocaleString('nb-NO', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch { return iso; }
}

function renderVisits(visits) {
  const sorted = [...(visits || [])].sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  lastVisits = sorted;
  $('feedCount').textContent = sorted.length ? sorted.length + ' siste' : '';
  if (!sorted.length) {
    $('visitFeed').innerHTML = '<div class="empty">Ingen besøk logget ennå. Åpne hazher.no i en annen fane, så dukker treff opp her innen få sekunder.</div>';
    knownIds = new Set();
    return;
  }
  const nextIds = new Set(sorted.map((v) => v.id));
  $('visitFeed').innerHTML = sorted.map((v) => {
    const isNew = !firstPaint && v.id && !knownIds.has(v.id);
    const place = [v.city, v.region].filter(Boolean).join(', ') || 'Ukjent by';
    const cc = v.country || '??';
    const geo = [v.lat, v.lon].filter(Boolean).join(', ');
    const bot = /bot|crawler/i.test(v.device || '') || /bot|crawler|spider/i.test(v.ua || '');
    return \`<article class="visit\${isNew ? ' new' : ''}" data-id="\${esc(v.id)}">
      <div class="when"><span class="ago">\${esc(relTime(v.ts))}</span><span class="abs">\${esc(absTime(v.ts))}</span></div>
      <div class="main">
        <div class="where">\${esc(place)} <span class="cc">\${esc(cc)}</span>\${v.continent ? \` · \${esc(v.continent)}\` : ''}</div>
        <div class="chips">
          <span class="chip\${bot ? ' r' : ''}">\${esc(v.device || '—')}</span>
          <span class="chip g">\${esc(v.os || '—')}</span>
          <span class="chip o">\${esc(v.browser || '—')}</span>
          \${v.language ? \`<span class="chip">\${esc(String(v.language).split(',')[0])}</span>\` : ''}
        </div>
        <div class="path">\${esc(v.method || 'GET')} \${esc(v.path || '/')}</div>
        <div class="facts">
          <div class="fact"><b>IP</b><span>\${esc(v.ip || '—')}</span></div>
          <div class="fact"><b>ISP</b><span>\${esc(v.isp || '—')}</span></div>
          <div class="fact"><b>ASN</b><span>\${esc(v.asn ? 'AS' + v.asn : '—')}</span></div>
          <div class="fact"><b>Colo</b><span>\${esc(v.colo || '—')}</span></div>
          <div class="fact"><b>Tidssone</b><span>\${esc(v.timezone || '—')}</span></div>
          <div class="fact"><b>Geo</b><span>\${esc(geo || '—')}</span></div>
          <div class="fact"><b>Referer</b><span>\${esc(v.referer || 'direkte')}</span></div>
          <div class="fact"><b>Språk</b><span>\${esc(v.language || '—')}</span></div>
        </div>
        \${v.ua ? \`<div class="ua">\${esc(v.ua)}</div>\` : ''}
      </div>
    </article>\`;
  }).join('');
  knownIds = nextIds;
  firstPaint = false;
}

function applyData(data) {
  if (!data || !data.ok) {
    $('statusLine').textContent = (data && data.error) || 'Feil';
    return;
  }
  if (!data.kvConfigured) {
    $('statusLine').textContent = data.message || 'KV mangler';
  } else {
    const n = (data.visits || []).length;
    const t = new Date().toLocaleTimeString('nb-NO');
    $('statusLine').textContent = n + ' treff · live · ' + t;
  }
  const s = data.summary || {};
  $('kTotal').textContent = s.total ?? 0;
  $('kCountries').textContent = (s.countries || []).length;
  $('kDevices').textContent = (s.devices || []).length;
  $('kIsps').textContent = (s.isps || []).length;
  const top = (s.paths && s.paths[0] && s.paths[0][0]) || '—';
  $('kTopPath').textContent = top.length > 22 ? top.slice(0, 20) + '…' : top;
  $('kTopPath').title = top;
  barList($('countryBars'), s.countries, 10);
  barList($('deviceBars'), s.devices, 8);
  barList($('osBars'), s.os, 8);
  barList($('browserBars'), s.browsers, 8);
  barList($('ispBars'), s.isps, 8);
  barList($('dayBars'), s.days, 10);
  barList($('pathBars'), s.paths, 14, true);
  renderVisits(data.visits || []);
}

async function loadTraffic(silent) {
  if (!silent) $('statusLine').textContent = 'Henter…';
  try {
    const res = await fetch('/api/hq/traffic', { cache: 'no-store' });
    if (res.status === 401) { location.reload(); return; }
    const data = await res.json();
    applyData(data);
  } catch (e) {
    if (!silent) $('statusLine').textContent = 'Nettfeil';
  }
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => loadTraffic(true), 3000);
}

$('loginBtn').addEventListener('click', login);
$('pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
$('logoutBtn').addEventListener('click', logout);
$('refreshBtn').addEventListener('click', () => loadTraffic(false));
if (loggedIn) {
  applyData(BOOT);
  startPolling();
  setInterval(() => {
    if (lastVisits.length) {
      // keep "nå / X sek siden" ticking without waiting for next poll
      document.querySelectorAll('.visit .ago').forEach((el, i) => {
        const v = lastVisits[i];
        if (v) el.textContent = relTime(v.ts);
      });
    }
  }, 1000);
}
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
