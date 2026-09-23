import { router } from 'expo-router';
import { View } from 'react-native';

import { AgentIcon, Body, Card, Row, StatusPill, timeAgo } from '@/components/ui';
import { useStore, type Run } from '@/lib/store';
import { getTemplate } from '@/lib/templates';
import { useTheme } from '@/lib/theme';

export function RunRow({ run }: { run: Run }) {
  const t = useTheme();
  const agent = useStore((s) => s.agents.find((a) => a.id === run.agentId));
  const tpl = getTemplate(agent?.templateId ?? 'custom');

  return (
    <Card onPress={() => router.push(`/run/${run.id}`)} style={{ padding: 14 }}>
      <Row style={{ alignItems: 'flex-start' }}>
        <AgentIcon icon={tpl.icon} color={tpl.color} size={34} />
        <View style={{ flex: 1, gap: 4 }}>
          <Body style={{ fontWeight: '600' }}>{run.title || run.input.slice(0, 60)}</Body>
          <Body muted style={{ fontSize: 13 }}>
            {agent?.name ?? 'Deleted agent'} · {timeAgo(run.createdAt)}
          </Body>
          <StatusPill status={run.status} />
        </View>
      </Row>
      {run.status === 'failed' && run.error && <Body style={{ color: t.danger, fontSize: 13 }}>{run.error}</Body>}
    </Card>
  );
}
