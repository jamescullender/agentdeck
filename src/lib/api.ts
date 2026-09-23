import { API_URL, DEMO_MODE } from './config';
import { getUserId } from './purchases';
import type { Agent, BusinessProfile } from './store';
import { useStore } from './store';
import { getTemplate } from './templates';

export type AgentResult = {
  title: string;
  summary: string;
  output: string;
  nextStep: string;
};

export class QuotaError extends Error {}

type UsageResponse = { used: number; limit: number; plan: 'free' | 'pro' };

async function headers() {
  const userId = await getUserId(useStore.getState().deviceId);
  return { 'Content-Type': 'application/json', 'X-App-User-Id': userId };
}

export async function runAgent(agent: Agent, business: BusinessProfile, input: string): Promise<AgentResult> {
  const template = getTemplate(agent.templateId);

  if (DEMO_MODE) return demoResult(agent, input);

  const res = await fetch(`${API_URL}/api/run`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({
      agent: { name: agent.name, role: template.role, instructions: agent.instructions },
      business,
      input,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (body.usage) useStore.getState().setUsage(body.usage.used, body.usage.limit);
  if (res.status === 402) throw new QuotaError(body.error ?? 'Monthly run limit reached');
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body.result as AgentResult;
}

export async function refreshUsage(): Promise<void> {
  if (DEMO_MODE) return;
  try {
    const res = await fetch(`${API_URL}/api/usage`, { headers: await headers() });
    if (!res.ok) return;
    const body = (await res.json()) as UsageResponse;
    useStore.getState().setUsage(body.used, body.limit);
  } catch {
    // Offline — keep the cached figure.
  }
}

async function demoResult(agent: Agent, input: string): Promise<AgentResult> {
  await new Promise((r) => setTimeout(r, 1200));
  const { usage, setUsage } = useStore.getState();
  if (usage.used >= usage.limit) throw new QuotaError('Monthly run limit reached');
  setUsage(usage.used + 1, usage.limit);
  const business = useStore.getState().business;
  return {
    title: `${agent.name}: draft ready`,
    summary: 'Demo mode — connect the AgentDeck server to generate real output.',
    output:
      `Hi there,\n\nThanks so much for getting in touch with ${business.name || 'us'}. ` +
      `This is a sample draft responding to:\n\n“${input.slice(0, 200)}”\n\n` +
      `Once the server is connected, this agent will write a tailored response using your business profile.\n\n` +
      `${business.signOff || 'Best wishes'}`,
    nextStep: 'Set EXPO_PUBLIC_API_URL to your deployed server to switch off demo mode.',
  };
}
