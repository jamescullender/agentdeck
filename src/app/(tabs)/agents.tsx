import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Switch, View } from 'react-native';

import { AgentIcon, Body, Button, Card, Empty, H2, Row, Screen } from '@/components/ui';
import { usePlan } from '@/lib/plan';
import { useStore } from '@/lib/store';
import { getTemplate } from '@/lib/templates';
import { useTheme } from '@/lib/theme';

export default function Agents() {
  const t = useTheme();
  const agents = useStore((s) => s.agents);
  const runs = useStore((s) => s.runs);
  const updateAgent = useStore((s) => s.updateAgent);
  const plan = usePlan();

  const add = () => router.push(plan.canAddAgent ? '/agent/new' : '/paywall');

  return (
    <Screen>
      {agents.length === 0 ? (
        <Empty
          icon="people"
          title="No agents yet"
          body="Agents handle one job each, like replying to reviews or chasing invoices."
          action={<Button title="Add your first agent" icon="add" onPress={add} />}
        />
      ) : (
        <>
          {agents.map((a) => {
            const tpl = getTemplate(a.templateId);
            const count = runs.filter((r) => r.agentId === a.id).length;
            return (
              <Card key={a.id} onPress={() => router.push(`/agent/${a.id}`)}>
                <Row>
                  <AgentIcon icon={tpl.icon} color={tpl.color} />
                  <View style={{ flex: 1 }}>
                    <H2>{a.name}</H2>
                    <Body muted style={{ fontSize: 13 }}>
                      {a.enabled ? 'Active' : 'Paused'} · {count} run{count === 1 ? '' : 's'} ·{' '}
                      {a.requireApproval ? 'Needs approval' : 'Auto-complete'}
                    </Body>
                  </View>
                  <Switch
                    value={a.enabled}
                    onValueChange={(enabled) => updateAgent(a.id, { enabled })}
                    trackColor={{ true: t.primary }}
                    accessibilityLabel={`${a.name} active`}
                  />
                </Row>
              </Card>
            );
          })}
          <Button title="Add agent" icon="add" variant="secondary" onPress={add} />
          {!plan.canAddAgent && (
            <Row style={{ justifyContent: 'center' }}>
              <Ionicons name="lock-closed" size={14} color={t.textMuted} />
              <Body muted style={{ fontSize: 13 }}>
                Free plan includes {plan.maxAgents} agents. Upgrade for unlimited.
              </Body>
            </Row>
          )}
        </>
      )}
    </Screen>
  );
}
