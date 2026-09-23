const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-App-User-Id',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

/** RevenueCat anonymous IDs look like `$RCAnonymousID:abc…`; device IDs are alphanumeric. */
export function getUserId(request: Request): string | null {
  const id = request.headers.get('x-app-user-id') ?? '';
  return /^[\w$:.-]{6,128}$/.test(id) ? id : null;
}
