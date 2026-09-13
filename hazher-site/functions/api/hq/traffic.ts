import {
  type Env,
  type VisitEvent,
  ipAllowed,
  json,
  loadVisits,
  notFound,
  readSession,
} from '../../_lib/hq';

type Ctx = { request: Request; env: Env };

function summarize(visits: VisitEvent[]) {
  const byCountry: Record<string, number> = {};
  const byDevice: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const byBrowser: Record<string, number> = {};
  const byOs: Record<string, number> = {};

  for (const v of visits) {
    const c = v.country || '??';
    byCountry[c] = (byCountry[c] || 0) + 1;
    byDevice[v.device] = (byDevice[v.device] || 0) + 1;
    byBrowser[v.browser] = (byBrowser[v.browser] || 0) + 1;
    byOs[v.os] = (byOs[v.os] || 0) + 1;
    const path = v.path.split('?')[0] || '/';
    byPath[path] = (byPath[path] || 0) + 1;
    const day = v.ts.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }

  const sortEntries = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]);

  return {
    total: visits.length,
    countries: sortEntries(byCountry).slice(0, 20),
    devices: sortEntries(byDevice),
    browsers: sortEntries(byBrowser),
    os: sortEntries(byOs),
    paths: sortEntries(byPath).slice(0, 25),
    days: sortEntries(byDay).slice(0, 30),
  };
}

export async function onRequestGet(context: Ctx): Promise<Response> {
  if (!ipAllowed(context.request, context.env)) return notFound();
  const session = await readSession(context.request, context.env);
  if (!session) return json({ ok: false, error: 'Ikke innlogget' }, 401);

  if (!context.env.HAZHER_HQ) {
    return json({
      ok: true,
      kvConfigured: false,
      visits: [],
      summary: summarize([]),
      message:
        'KV-binding HAZHER_HQ mangler. Opprett KV i Cloudflare og bind den til Pages-prosjektet.',
    });
  }

  const visits = await loadVisits(context.env, 21, 500);
  return json({
    ok: true,
    kvConfigured: true,
    visits,
    summary: summarize(visits),
  });
}
