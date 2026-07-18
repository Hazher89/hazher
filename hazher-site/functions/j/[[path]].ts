type PagesContext = {
  params: { path?: string | string[] };
  request: Request;
};

export async function onRequest(context: PagesContext): Promise<Response> {
  const raw = context.params.path;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response('Not found', { status: 404 });
  }
  const host = new URL(context.request.url).host;
  const target =
    `https://rueqwgcxmcukmvjdrnfc.supabase.co/functions/v1/job-share/${id}`;
  const upstream = await fetch(target, {
    headers: {
      Accept: 'text/html',
      'x-share-host': host,
      'x-forwarded-host': host,
    },
    redirect: 'follow',
  });
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=120',
    },
  });
}
