import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { RunRow } from '@/components/RunRow';
import { AgentIcon, Body, Button, Card, H1, H2, Row, Screen, Stat } from '@/components/ui';
import { usePlan } from '@/lib/plan';
import { currentMonth, useStore } from '@/lib/store';
import { getTemplate } from '@/lib/templates';
import { space, useTheme } from '@/lib/theme';

export default function Dashboard() {
  const t = useTheme();
  const business = useStore((s) => s.business);
  const agents = useStore((s) => s.agents);
  const runs = useStore((s) => s.runs);
  const plan = usePlan();

  const stats = useMemo(() => {
    const month = currentMonth();
    const thisMonth = runs.filter(
      (r) => new Date(r.createdAt).toISOString().startsWith(month) && r.status !== 'failed' && r.status !== 'rejected',
    );
    const minutes = thisMonth.reduce((sum, r) => {
      const agent = agents.find((a) => a.id === r.agentId);
      return sum + (agent ? getTemplate(agent.templateId).minutesSaved : 0);
    }, 0);
    return {
      tasks: thisMonth.length,
      hours: (minutes / 60).toFixed(minutes < 600 ? 1 : 0),
      pending: runs.filter((r) => r.status === 'pending').length,
    };
  }, [runs, agents]);

  const active = agents.filter((a) => a.enabled);
  const usagePct = Math.min(1, plan.used / Math.max(1, plan.limit));

  return (
    <Screen>
      <View>
        <Body muted>{greeting()}</Body>
        <H1>{business.name}</H1>
      </View>

      <Row style={{ alignItems: 'stretch' }}>
        <Stat icon="checkmark-circle" label="Tasks this month" value={String(stats.tasks)} />
        <Stat icon="time" label="Hours saved" value={stats.hours} />
        <Stat icon="file-tray" label="Awaiting you" value={String(stats.pending)} />
      </Row>

      {stats.pending > 0 && (
        <Card onPress={() => router.push('/inbox')} style={{ backgroundColor: t.warningBg, borderColor: t.warningBg }}>
          <Row>
            <Ionicons name="alert-circle" size={22} color={t.warning} />
            <Body style={{ flex: 1, color: t.warning, fontWeight: '600' }}>
              {stats.pending} draft{stats.pending === 1 ? '' : 's'} waiting for your approval
            </Body>
            <Ionicons name="chevron-forward" size={18} color={t.warning} />
          </Row>
        </Card>
      )}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>{plan.isPro ? 'Pro plan' : 'Free plan'}</H2>
          <Text style={{ color: t.textMuted, fontVariant: ['tabular-nums'] }}>
            {plan.used} / {plan.limit} runs
          </Text>
        </Row>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: t.surfaceAlt, overflow: 'hidden' }}>
          <View
            style={{
              width: `${usagePct * 100}%`,
              height: '100%',
              backgroundColor: usagePct >= 0.9 ? t.danger : t.primary,
            }}
          />
        </View>
        {!plan.isPro && <Button title="Upgrade to Pro" icon="rocket" onPress={() => router.push('/paywall')} />}
      </Card>

      <View style={{ gap: space.sm }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>Active agents</H2>
          <Text style={{ color: t.primary, fontWeight: '600' }} onPress={() => router.push('/agents')}>
            Manage
          </Text>
        </Row>
        {active.length === 0 ? (
          <Card onPress={() => router.push('/agent/new')}>
            <Body muted>No active agents. Tap to add one.</Body>
          </Card>
        ) : (
          active.map((a) => {
            const tpl = getTemplate(a.templateId);
            return (
              <Card key={a.id} onPress={() => router.push(`/agent/${a.id}`)}>
                <Row>
                  <AgentIcon icon={tpl.icon} color={tpl.color} />
                  <View style={{ flex: 1 }}>
                    <H2>{a.name}</H2>
                    <Body muted>{tpl.tagline}</Body>
                  </View>
                  <Ionicons name="play-circle" size={30} color={t.primary} />
                </Row>
              </Card>
            );
          })
        )}
      </View>

      {runs.length > 0 && (
        <View style={{ gap: space.sm }}>
          <H2>Recent activity</H2>
          {runs.slice(0, 5).map((r) => (
            <RunRow key={r.id} run={r} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
