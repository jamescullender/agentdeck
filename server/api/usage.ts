import { isPro } from '../lib/entitlements.js';
import { getUserId, json, preflight } from '../lib/http.js';
import { LIMITS, getUsed, quotaEnabled } from '../lib/quota.js';

export function OPTIONS() {
  return preflight();
}

export async function GET(request: Request): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) return json({ error: 'Missing user ID' }, 400);
  const [pro, used] = await Promise.all([isPro(userId), getUsed(userId)]);
  return json({ used, limit: pro ? LIMITS.pro : LIMITS.free, plan: pro ? 'pro' : 'free', quotaEnforced: quotaEnabled });
}
