import {
  type Env,
  ipAllowed,
  json,
  loadRecentVisits,
  notFound,
  readSession,
  summarizeVisits,
} from '../../_lib/hq';

type Ctx = { request: Request; env: Env };

export async function onRequestGet(context: Ctx): Promise<Response> {
  if (!ipAllowed(context.request, context.env)) return notFound();
  const session = await readSession(context.request, context.env);
  if (!session) return json({ ok: false, error: 'Ikke innlogget' }, 401);

  if (!context.env.HAZHER_HQ) {
    return json({
      ok: true,
      kvConfigured: false,
      visits: [],
      summary: summarizeVisits([]),
      message:
        'KV-binding HAZHER_HQ mangler. Opprett KV i Cloudflare og bind den til Pages-prosjektet.',
    });
  }

  const visits = await loadRecentVisits(context.env, 200);
  return json({
    ok: true,
    kvConfigured: true,
    visits,
    summary: summarizeVisits(visits),
    fetchedAt: new Date().toISOString(),
  });
}
