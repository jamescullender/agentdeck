import Anthropic from '@anthropic-ai/sdk';

import { RefusedError, runAgent, type AgentSpec, type BusinessProfile } from '../lib/agent.js';
import { isPro } from '../lib/entitlements.js';
import { getUserId, json, preflight } from '../lib/http.js';
import { LIMITS, getUsed, recordRun } from '../lib/quota.js';

type Body = { agent?: Partial<AgentSpec>; business?: Partial<BusinessProfile>; input?: string };

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

export function OPTIONS() {
  return preflight();
}

export async function POST(request: Request): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) return json({ error: 'Missing user ID' }, 400);

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const input = str(body.input, 8000).trim();
  if (input.length < 3) return json({ error: 'Give the agent something to work on' }, 400);

  const agent: AgentSpec = {
    name: str(body.agent?.name, 80) || 'Assistant',
    role: str(body.agent?.role, 2000),
    instructions: str(body.agent?.instructions, 2000),
  };
  const business: BusinessProfile = {
    name: str(body.business?.name, 120),
    industry: str(body.business?.industry, 120),
    location: str(body.business?.location, 120),
    description: str(body.business?.description, 4000),
    tone: str(body.business?.tone, 20) || 'friendly',
    signOff: str(body.business?.signOff, 120),
  };

  const [pro, used] = await Promise.all([isPro(userId), getUsed(userId)]);
  const limit = pro ? LIMITS.pro : LIMITS.free;
  if (used >= limit) {
    return json({ error: 'Monthly run limit reached', usage: { used, limit } }, 402);
  }

  try {
    const result = await runAgent(agent, business, input);
    const nowUsed = await recordRun(userId);
    return json({ result, usage: { used: nowUsed || used + 1, limit } });
  } catch (e) {
    if (e instanceof RefusedError) return json({ error: e.message }, 422);
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'Busy right now, try again in a minute' }, 503);
    if (e instanceof Anthropic.APIError) {
      console.error('Anthropic API error', e.status, e.message);
      return json({ error: 'The AI service had a problem, please try again' }, 502);
    }
    console.error(e);
    return json({ error: 'Something went wrong' }, 500);
  }
}
