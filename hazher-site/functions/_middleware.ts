import {
  type Env,
  buildVisit,
  ipAllowed,
  logVisit,
  shouldSkipLogging,
} from './_lib/hq';

type Context = {
  request: Request;
  next: () => Promise<Response>;
  env: Env;
  waitUntil: (p: Promise<unknown>) => void;
};

export async function onRequest(context: Context): Promise<Response> {
  const url = new URL(context.request.url);
  const path = url.pathname;

  const isHq =
    path === '/hq' ||
    path.startsWith('/hq/') ||
    path === '/api/hq' ||
    path.startsWith('/api/hq/');

  if (isHq && !ipAllowed(context.request, context.env)) {
    return new Response('Not Found', {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  if (
    context.request.method === 'GET' &&
    !shouldSkipLogging(path)
  ) {
    const visit = buildVisit(context.request);
    context.waitUntil(logVisit(context.env, visit));
  }

  return context.next();
}
