// Per-user monthly run counts, stored in Upstash Redis via its REST API.
// Without Redis configured, quotas are not enforced (fine for local dev,
// not for production — anyone could run up your Claude bill).

// The Vercel Marketplace integration names these KV_REST_API_*.
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const LIMITS = {
  free: Number(process.env.FREE_RUNS_PER_MONTH ?? 20),
  pro: Number(process.env.PRO_RUNS_PER_MONTH ?? 300),
};

export const quotaEnabled = Boolean(REDIS_URL && REDIS_TOKEN);

async function redis<T>(...command: (string | number)[]): Promise<T | null> {
  if (!quotaEnabled) return null;
  const res = await fetch(REDIS_URL!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  return ((await res.json()) as { result: T }).result;
}

const key = (userId: string) => `runs:${new Date().toISOString().slice(0, 7)}:${userId}`;

export async function getUsed(userId: string): Promise<number> {
  return Number((await redis<string>('GET', key(userId))) ?? 0);
}

export async function recordRun(userId: string): Promise<number> {
  const k = key(userId);
  const used = (await redis<number>('INCR', k)) ?? 0;
  if (used === 1) await redis('EXPIRE', k, 60 * 60 * 24 * 40);
  return used;
}
