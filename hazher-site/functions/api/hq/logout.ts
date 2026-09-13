import { type Env, ipAllowed, json, notFound, sessionCookie } from '../../_lib/hq';

type Ctx = { request: Request; env: Env };

export async function onRequestPost(context: Ctx): Promise<Response> {
  if (!ipAllowed(context.request, context.env)) return notFound();
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', true) });
}
