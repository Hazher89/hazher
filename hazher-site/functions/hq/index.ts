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
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<style>
:root{
  --bg:#0b0f14; --bg2:#121820; --card:#161d27; --line:#243041;
  --text:#eef3f8; --muted:#8b9bb0; --accent:#3dd68c; --accent2:#5b8cff;
  --warn:#f5a524; --danger:#ff6b6b; --radius:18px;
}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;font-family:"Instrument Sans",system-ui,sans-serif;background:
  radial-gradient(1200px 600px at 10% -10%, #163528 0%, transparent 55%),
  radial-gradient(900px 500px at 100% 0%, #1a2744 0%, transparent 50%),
  var(--bg);color:var(--text)}
a{color:var(--accent2)}
.shell{max-width:1180px;margin:0 auto;padding:28px 18px 64px}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:28px}
.brand{font-weight:700;letter-spacing:-.03em;font-size:1.35rem}
.brand span{color:var(--accent)}
.sub{color:var(--muted);font-size:.92rem;margin-top:4px}
.pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.03);font-size:.82rem;color:var(--muted)}
.pill b{color:var(--text);font-family:"JetBrains Mono",monospace;font-weight:600}
.card{background:linear-gradient(180deg,rgba(255,255,255,.03),transparent),var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:22px;box-shadow:0 20px 50px rgba(0,0,0,.25)}
.grid{display:grid;gap:14px}
.grid.kpi{grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:14px}
.grid.two{grid-template-columns:1.2fr .8fr;margin-bottom:14px}
@media(max-width:900px){.grid.kpi,.grid.two{grid-template-columns:1fr 1fr}.top{flex-direction:column}}
@media(max-width:560px){.grid.kpi,.grid.two{grid-template-columns:1fr}}
.kpi h3{margin:0;font-size:.78rem;color:var(--muted);font-weight:500;text-transform:uppercase;letter-spacing:.06em}
.kpi .v{margin-top:8px;font-size:1.8rem;font-weight:700;letter-spacing:-.04em}
.login-wrap{max-width:420px;margin:8vh auto 0}
label{display:block;font-size:.85rem;color:var(--muted);margin:0 0 6px}
input{width:100%;padding:14px 14px;border-radius:12px;border:1px solid var(--line);background:#0e141c;color:var(--text);font:inherit;margin-bottom:14px}
input:focus{outline:2px solid rgba(61,214,140,.35);border-color:var(--accent)}
button{appearance:none;border:0;border-radius:12px;padding:13px 16px;font:inherit;font-weight:600;cursor:pointer}
.btn{background:linear-gradient(135deg,var(--accent),#2bb673);color:#062216;width:100%}
.btn:hover{filter:brightness(1.05)}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--line)}
.err{color:var(--danger);font-size:.9rem;min-height:1.2em;margin-bottom:8px}
h2{margin:0 0 12px;font-size:1.05rem;letter-spacing:-.02em}
.bars{display:flex;flex-direction:column;gap:8px}
.bar-row{display:grid;grid-template-columns:88px 1fr 40px;gap:10px;align-items:center;font-size:.86rem}
.bar-track{height:8px;border-radius:99px;background:#0e141c;overflow:hidden;border:1px solid var(--line)}
.bar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--accent2),var(--accent))}
.mono{font-family:"JetBrains Mono",monospace;font-size:.78rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--muted);font-weight:500;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em}
tr:hover td{background:rgba(255,255,255,.02)}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(91,140,255,.15);color:#a9c2ff;font-size:.75rem}
.tag.g{background:rgba(61,214,140,.14);color:#8ef0bf}
.tag.o{background:rgba(245,165,36,.14);color:#ffd089}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.muted{color:var(--muted)}
.hidden{display:none!important}
.scroll{max-height:520px;overflow:auto}
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

  <section id="loginView" class="login-wrap card ${opts.loggedIn ? 'hidden' : ''}">
    <h2>Logg inn</h2>
    <p class="muted" style="margin-top:0;margin-bottom:18px;font-size:.92rem">Siden er usynlig for andre IP-adresser (404).</p>
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
      <span class="muted" id="statusLine" style="align-self:center;font-size:.85rem"></span>
    </div>
    <div class="grid kpi">
      <div class="card kpi"><h3>Besøk</h3><div class="v" id="kTotal">—</div></div>
      <div class="card kpi"><h3>Land</h3><div class="v" id="kCountries">—</div></div>
      <div class="card kpi"><h3>Enheter</h3><div class="v" id="kDevices">—</div></div>
      <div class="card kpi"><h3>Topp side</h3><div class="v" id="kTopPath" style="font-size:1.05rem">—</div></div>
    </div>
    <div class="grid two">
      <div class="card">
        <h2>Trafikk per land</h2>
        <div class="bars" id="countryBars"></div>
      </div>
      <div class="card">
        <h2>Enheter / OS / nettleser</h2>
        <div class="bars" id="deviceBars"></div>
      </div>
    </div>
    <div class="card" style="margin-bottom:14px">
      <h2>Mest besøkte sider</h2>
      <div class="bars" id="pathBars"></div>
    </div>
    <div class="card">
      <h2>Siste besøk</h2>
      <p class="muted" style="margin-top:0;font-size:.85rem">IP, sted, enhet og tidspunkt for hver treff på hazher.no</p>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Tid</th><th>Sted</th><th>Enhet</th><th>Side</th><th>IP / ISP</th>
            </tr>
          </thead>
          <tbody id="visitRows"></tbody>
        </table>
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

function barList(el, rows, maxN = 8) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  el.innerHTML = rows.slice(0, maxN).map(([label, n]) => {
    const pct = Math.round((n / max) * 100);
    return \`<div class="bar-row"><div>\${esc(label || '—')}</div><div class="bar-track"><div class="bar-fill" style="width:\${pct}%"></div></div><div class="mono">\${n}</div></div>\`;
  }).join('') || '<div class="muted">Ingen data ennå</div>';
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'medium' });
  } catch { return iso; }
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
    $('statusLine').textContent = \`\${data.visits.length} treff lastet · oppdatert \${new Date().toLocaleTimeString('nb-NO')}\`;
  }
  const s = data.summary || { total: 0, countries: [], devices: [], paths: [], browsers: [], os: [] };
  $('kTotal').textContent = s.total;
  $('kCountries').textContent = s.countries.length;
  $('kDevices').textContent = s.devices.length;
  $('kTopPath').textContent = (s.paths[0] && s.paths[0][0]) || '—';
  barList($('countryBars'), s.countries);
  const mix = [...(s.devices||[]), ...(s.os||[]).slice(0,4), ...(s.browsers||[]).slice(0,4)];
  barList($('deviceBars'), mix, 10);
  barList($('pathBars'), s.paths, 12);

  const rows = (data.visits || []).map((v) => {
    const place = [v.city, v.region, v.country].filter(Boolean).join(', ') || '—';
    const device = \`<span class="tag">\${esc(v.device)}</span> <span class="tag g">\${esc(v.os)}</span> <span class="tag o">\${esc(v.browser)}</span>\`;
    return \`<tr>
      <td class="mono">\${esc(fmtTime(v.ts))}</td>
      <td>\${esc(place)}<div class="muted mono" style="margin-top:4px">\${esc(v.timezone || '')}</div></td>
      <td>\${device}</td>
      <td class="mono">\${esc(v.path)}</td>
      <td class="mono">\${esc(v.ip)}<div class="muted" style="margin-top:4px">\${esc(v.isp || '')}</div></td>
    </tr>\`;
  }).join('');
  $('visitRows').innerHTML = rows || '<tr><td colspan="5" class="muted">Ingen besøk logget ennå. Surfe litt på hazher.no, deretter Oppdater.</td></tr>';
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
