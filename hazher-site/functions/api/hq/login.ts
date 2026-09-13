import {
  type Env,
  clientIp,
  createSessionToken,
  ipAllowed,
  json,
  notFound,
  readSession,
  sessionCookie,
  verifyHqLogin,
} from '../../_lib/hq';

type Ctx = { request: Request; env: Env };

export async function onRequestPost(context: Ctx): Promise<Response> {
  if (!ipAllowed(context.request, context.env)) return notFound();

  try {
    let body: { username?: string; password?: string } = {};
    try {
      body = await context.request.json();
    } catch {
      return json({ ok: false, error: 'Ugyldig forespørsel' }, 400);
    }

    const username = (body.username || '').trim();
    const password = body.password || '';
    const ok = await verifyHqLogin(context.env, username, password);
    if (!ok) {
      return json({ ok: false, error: 'Feil bruker eller passord' }, 401);
    }

    const token = await createSessionToken(context.env, username);
    return json(
      { ok: true, user: username },
      200,
      { 'Set-Cookie': sessionCookie(token) },
    );
  } catch (e) {
    return json(
      { ok: false, error: 'Serverfeil ved innlogging', detail: String(e) },
      500,
    );
  }
}

export async function onRequestGet(context: Ctx): Promise<Response> {
  if (!ipAllowed(context.request, context.env)) return notFound();
  const session = await readSession(context.request, context.env);
  return json({
    ok: !!session,
    user: session?.user || null,
    ip: clientIp(context.request),
  });
}
