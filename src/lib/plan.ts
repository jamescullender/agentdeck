import { PLAN_LIMITS } from './config';
import { useIsPro } from './purchases';
import { currentMonth, useStore } from './store';

export function usePlan() {
  const isPro = useIsPro();
  const usage = useStore((s) => s.usage);
  const agentCount = useStore((s) => s.agents.length);
  const limits = isPro ? PLAN_LIMITS.pro : PLAN_LIMITS.free;
  // A cached count from last month doesn't apply any more.
  const used = usage.month === currentMonth() ? usage.used : 0;
  // The server's limit is authoritative, but reflect a fresh upgrade immediately.
  const limit = isPro ? Math.max(usage.limit, limits.runsPerMonth) : usage.limit;
  return {
    isPro,
    used,
    limit,
    canAddAgent: agentCount < limits.agents,
    maxAgents: limits.agents,
    outOfRuns: used >= limit,
  };
}

