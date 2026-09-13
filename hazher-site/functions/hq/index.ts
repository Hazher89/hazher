import {
  type Env,
  clientIp,
  ipAllowed,
  notFound,
  readSession,
} from '../_lib/hq';

type Ctx = { request: Request; env: Env };

export async function onRequestGet(context: Ctx): Promise<Response> {
  if (!ipAllowed(context.request, context.env)) return notFound();
  const session = await readSession(context.request, context.env);
  const ip = clientIp(context.request);
  const html = renderHq({ loggedIn: !!session, user: session?.user || null, ip });
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function renderHq(opts: { loggedIn: boolean; user: string | null; ip: string }): string {
  return `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Hazher HQ</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
:root{
  --bg:#070b10;
  --panel:#0f151d;
  --panel2:#141c27;
  --line:rgba(255,255,255,.08);
  --text:#edf2f7;
  --muted:#8a98ab;
  --accent:#3dd68c;
  --blue:#6ea8ff;
  --amber:#f0b45a;
  --danger:#ff6b6b;
  --radius:16px;
}
*{box-sizing:border-box}
html,body{margin:0}
body{
  min-height:100vh;
  font-family:"Instrument Sans",system-ui,sans-serif;
  color:var(--text);
  background:
    radial-gradient(900px 420px at 12% -8%, rgba(61,214,140,.14), transparent 55%),
    radial-gradient(700px 380px at 92% 0%, rgba(110,168,255,.12), transparent 50%),
    var(--bg);
}
.shell{max-width:1080px;margin:0 auto;padding:24px 16px 72px}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:22px}
.brand{font-weight:700;letter-spacing:-.03em;font-size:1.4rem}
.brand span{color:var(--accent)}
.sub{color:var(--muted);font-size:.9rem;margin-top:4px;line-height:1.4}
.pill{
  display:inline-flex;align-items:center;gap:8px;padding:8px 12px;
  border:1px solid var(--line);border-radius:999px;
  background:rgba(255,255,255,.03);font-size:.8rem;color:var(--muted);white-space:nowrap
}
.pill b{color:var(--text);font-family:"JetBrains Mono",monospace;font-weight:600}
.panel{
  background:linear-gradient(180deg,rgba(255,255,255,.03),transparent 40%),var(--panel);
  border:1px solid var(--line);border-radius:var(--radius);padding:20px
}
.login-wrap{max-width:400px;margin:10vh auto 0}
label{display:block;font-size:.85rem;color:var(--muted);margin:0 0 6px}
input{
  width:100%;padding:13px 14px;border-radius:12px;border:1px solid var(--line);
  background:#0a1017;color:var(--text);font:inherit;margin-bottom:14px
}
input:focus{outline:2px solid rgba(61,214,140,.3);border-color:var(--accent)}
button{appearance:none;border:0;border-radius:12px;padding:12px 15px;font:inherit;font-weight:600;cursor:pointer}
.btn{background:linear-gradient(135deg,var(--accent),#2bb673);color:#062216;width:100%}
.btn-ghost{background:rgba(255,255,255,.03);color:var(--muted);border:1px solid var(--line)}
.btn-ghost:hover{color:var(--text);border-color:rgba(255,255,255,.16)}
.err{color:var(--danger);font-size:.9rem;min-height:1.2em;margin-bottom:8px}
.muted{color:var(--muted)}
.hidden{display:none!important}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:18px}
h2{margin:0;font-size:1.05rem;letter-spacing:-.02em}
.sec-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:14px}
.sec-head p{margin:0;font-size:.84rem;color:var(--muted)}
.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:18px}
.kpi{padding:16px 16px 14px}
.kpi .l{font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-weight:500}
.kpi .v{margin-top:8px;font-size:1.7rem;font-weight:700;letter-spacing:-.04em;line-height:1.1;word-break:break-word}
.charts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
.charts .full{grid-column:1 / -1}
.bars{display:flex;flex-direction:column;gap:12px}
.bar-item{display:flex;flex-direction:column;gap:6px;min-width:0}
.bar-meta{display:flex;justify-content:space-between;align-items:baseline;gap:12px;min-width:0}
.bar-label{
  font-size:.86rem;line-height:1.35;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap
}
.bar-label.wrap{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.bar-n{font-family:"JetBrains Mono",monospace;font-size:.78rem;color:var(--muted);flex-shrink:0}
.bar-track{height:7px;border-radius:99px;background:#0a1017;overflow:hidden;border:1px solid var(--line)}
.bar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--blue),var(--accent))}
.mono{font-family:"JetBrains Mono",monospace;font-size:.78rem}
.feed{display:flex;flex-direction:column;gap:10px;max-height:min(70vh,720px);overflow:auto;padding-right:2px}
.visit{
  display:grid;grid-template-columns:118px 1fr;gap:14px 18px;
  padding:14px 16px;border-radius:14px;background:var(--panel2);
  border:1px solid var(--line);min-width:0
}
.visit-time{font-family:"JetBrains Mono",monospace;font-size:.8rem;line-height:1.45;color:var(--text)}
.visit-time .day{color:var(--muted);display:block;margin-bottom:2px}
.visit-main{min-width:0;display:flex;flex-direction:column;gap:8px}
.visit-where{font-size:.95rem;font-weight:600;letter-spacing:-.01em}
.visit-where span{color:var(--muted);font-weight:500;font-size:.84rem}
.visit-meta{display:flex;flex-wrap:wrap;gap:6px}
.chip{
  display:inline-flex;align-items:center;padding:4px 9px;border-radius:999px;
  font-size:.74rem;line-height:1.2;background:rgba(110,168,255,.12);color:#b7d0ff
}
.chip.g{background:rgba(61,214,140,.12);color:#9aefc5}
.chip.o{background:rgba(240,180,90,.14);color:#ffd39a}
.chip.n{background:rgba(255,255,255,.05);color:var(--muted)}
.visit-path{
  font-family:"JetBrains Mono",monospace;font-size:.76rem;color:var(--muted);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap
}
.visit-path:hover{color:var(--text);white-space:normal;word-break:break-all}
.empty{padding:28px 8px;text-align:center;color:var(--muted);font-size:.92rem}
@media(max-width:820px){
  .kpis,.charts{grid-template-columns:1fr 1fr}
  .visit{grid-template-columns:1fr;gap:8px}
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
      <div class="sub">Privat kontrollrom · kun din IP · kun HAZHER</div>
    </div>
    <div class="pill">Din IP <b id="myIp">${escapeHtml(opts.ip || '—')}</b></div>
  </div>

  <section id="loginView" class="login-wrap panel ${opts.loggedIn ? 'hidden' : ''}">
    <h2>Logg inn</h2>
    <p class="muted" style="margin:8px 0 18px;font-size:.92rem">Siden er usynlig for andre IP-adresser (404).</p>
    <div class="err" id="loginErr"></div>
    <label for="user">Bruker</label>
    <input id="user" autocomplete="username" spellcheck="false"/>
    <label for="pass">Passord</label>
    <input id="pass" type="password" autocomplete="current-password"/>
    <button class="btn" id="loginBtn" type="button">Gå inn</button>
  </section>

  <section id="dashView" class="${opts.loggedIn ? '' : 'hidden'}">
    <div class="toolbar">
      <button class="btn-ghost" id="refreshBtn" type="button">Oppdater</button>
      <button class="btn-ghost" id="logoutBtn" type="button">Logg ut</button>
      <span class="muted" id="statusLine" style="font-size:.85rem"></span>
    </div>

    <div class="kpis">
      <div class="panel kpi"><div class="l">Besøk</div><div class="v" id="kTotal">—</div></div>
      <div class="panel kpi"><div class="l">Land</div><div class="v" id="kCountries">—</div></div>
      <div class="panel kpi"><div class="l">Enheter</div><div class="v" id="kDevices">—</div></div>
      <div class="panel kpi"><div class="l">Topp side</div><div class="v" id="kTopPath" style="font-size:1.05rem">—</div></div>
    </div>

    <div class="panel" style="margin-bottom:18px">
      <div class="sec-head">
        <div>
          <h2>Siste besøkende</h2>
          <p>Når · hvor · enhet · side — nyeste først</p>
        </div>
      </div>
      <div class="feed" id="visitFeed"></div>
    </div>

    <div class="charts">
      <div class="panel">
        <div class="sec-head"><h2>Land</h2></div>
        <div class="bars" id="countryBars"></div>
      </div>
      <div class="panel">
        <div class="sec-head"><h2>Enheter</h2></div>
        <div class="bars" id="deviceBars"></div>
      </div>
      <div class="panel">
        <div class="sec-head"><h2>OS</h2></div>
        <div class="bars" id="osBars"></div>
      </div>
      <div class="panel">
        <div class="sec-head"><h2>Nettleser</h2></div>
        <div class="bars" id="browserBars"></div>
      </div>
      <div class="panel full">
        <div class="sec-head"><h2>Mest besøkte sider</h2></div>
        <div class="bars" id="pathBars"></div>
      </div>
    </div>
  </section>
</div>
<script>
const loggedIn = ${opts.loggedIn ? 'true' : 'false'};
const $ = (id) => document.getElementById(id);

async function login() {
  $('loginErr').textContent = '';
  const username = $('user').value.trim();
  const password = $('pass').value;
  const res = await fetch('/api/hq/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    $('loginErr').textContent = data.error || ('Innlogging feilet (' + res.status + ')');
    return;
  }
  $('loginView').classList.add('hidden');
  $('dashView').classList.remove('hidden');
  await loadTraffic();
}

async function logout() {
  await fetch('/api/hq/logout', { method: 'POST' });
  location.reload();
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function barList(el, rows, maxN = 8, wrap = false) {
  if (!rows || !rows.length) {
    el.innerHTML = '<div class="empty">Ingen data ennå</div>';
    return;
  }
  const slice = rows.slice(0, maxN);
  const max = Math.max(1, ...slice.map((r) => r[1]));
  el.innerHTML = slice.map(([label, n]) => {
    const pct = Math.round((n / max) * 100);
    const cls = wrap ? 'bar-label wrap' : 'bar-label';
    const title = esc(label || '—');
    return \`<div class="bar-item">
      <div class="bar-meta">
        <div class="\${cls}" title="\${title}">\${title}</div>
        <div class="bar-n">\${n}</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:\${pct}%"></div></div>
    </div>\`;
  }).join('');
}

function fmtParts(iso) {
  try {
    const d = new Date(iso);
    return {
      day: d.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' }),
      time: d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  } catch {
    return { day: '', time: iso };
  }
}

function renderVisits(visits) {
  const sorted = [...(visits || [])].sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  if (!sorted.length) {
    $('visitFeed').innerHTML = '<div class="empty">Ingen besøk logget ennå. Surfe litt på hazher.no, deretter Oppdater.</div>';
    return;
  }
  $('visitFeed').innerHTML = sorted.map((v) => {
    const { day, time } = fmtParts(v.ts);
    const placeBits = [v.city, v.region, v.country].filter(Boolean);
    const place = placeBits.join(', ') || 'Ukjent sted';
    const path = v.path || '/';
    const ipLine = [v.ip, v.isp].filter(Boolean).join(' · ');
    return \`<article class="visit">
      <div class="visit-time"><span class="day">\${esc(day)}</span>\${esc(time)}</div>
      <div class="visit-main">
        <div class="visit-where">\${esc(place)} <span>· \${esc(ipLine || '—')}</span></div>
        <div class="visit-meta">
          <span class="chip">\${esc(v.device || '—')}</span>
          <span class="chip g">\${esc(v.os || '—')}</span>
          <span class="chip o">\${esc(v.browser || '—')}</span>
          \${v.timezone ? \`<span class="chip n">\${esc(v.timezone)}</span>\` : ''}
        </div>
        <div class="visit-path" title="\${esc(path)}">\${esc(path)}</div>
      </div>
    </article>\`;
  }).join('');
}

async function loadTraffic() {
  $('statusLine').textContent = 'Henter trafikk…';
  const res = await fetch('/api/hq/traffic', { cache: 'no-store' });
  if (res.status === 401) {
    location.reload();
    return;
  }
  const data = await res.json();
  if (!data.ok) {
    $('statusLine').textContent = data.error || 'Feil';
    return;
  }
  if (!data.kvConfigured) {
    $('statusLine').textContent = data.message || 'KV mangler';
  } else {
    $('statusLine').textContent = \`\${(data.visits || []).length} treff · oppdatert \${new Date().toLocaleTimeString('nb-NO')}\`;
  }

  const s = data.summary || { total: 0, countries: [], devices: [], paths: [], browsers: [], os: [] };
  $('kTotal').textContent = s.total;
  $('kCountries').textContent = s.countries.length;
  $('kDevices').textContent = s.devices.length;
  const top = (s.paths[0] && s.paths[0][0]) || '—';
  $('kTopPath').textContent = top.length > 28 ? top.slice(0, 26) + '…' : top;
  $('kTopPath').title = top;

  barList($('countryBars'), s.countries, 8);
  barList($('deviceBars'), s.devices, 6);
  barList($('osBars'), s.os, 6);
  barList($('browserBars'), s.browsers, 6);
  barList($('pathBars'), s.paths, 12, true);
  renderVisits(data.visits || []);
}

$('loginBtn').addEventListener('click', login);
$('pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
$('logoutBtn').addEventListener('click', logout);
$('refreshBtn').addEventListener('click', loadTraffic);
if (loggedIn) loadTraffic();
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
