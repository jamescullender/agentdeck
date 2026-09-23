import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, TextInput, View } from 'react-native';

import { Body, Button, Card, H1, H2, Row, Screen, StatusPill, timeAgo } from '@/components/ui';
import { useStore } from '@/lib/store';
import { radius, space, useTheme } from '@/lib/theme';

export default function RunDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const run = useStore((s) => s.runs.find((r) => r.id === id));
  const agent = useStore((s) => s.agents.find((a) => a.id === run?.agentId));
  const updateRun = useStore((s) => s.updateRun);
  const [copied, setCopied] = useState(false);

  if (!run) return <Screen><Body muted>This result no longer exists.</Body></Screen>;

  const copy = async () => {
    await Clipboard.setStringAsync(run.output);
    Haptics.selectionAsync();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const decide = (status: 'approved' | 'rejected') => {
    updateRun(run.id, { status });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <Screen>
      <View style={{ gap: space.xs }}>
        <StatusPill status={run.status} />
        <H1>{run.title}</H1>
        <Body muted>
          {agent?.name ?? 'Deleted agent'} · {timeAgo(run.createdAt)}
        </Body>
      </View>

      {run.summary !== '' && <Body>{run.summary}</Body>}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>Draft</H2>
          {run.status === 'pending' && <Body muted style={{ fontSize: 13 }}>Tap to edit</Body>}
        </Row>
        <TextInput
          value={run.output}
          onChangeText={(output) => updateRun(run.id, { output })}
          editable={run.status === 'pending'}
          multiline
          scrollEnabled={false}
          style={{
            color: t.text,
            fontSize: 16,
            lineHeight: 23,
            backgroundColor: t.surfaceAlt,
            borderRadius: radius.md,
            padding: space.md,
            minHeight: 220,
            textAlignVertical: 'top',
          }}
        />
        <Row>
          <View style={{ flex: 1 }}>
            <Button title={copied ? 'Copied' : 'Copy'} icon={copied ? 'checkmark' : 'copy'} variant="secondary" onPress={copy} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Share" icon="share-outline" variant="secondary" onPress={() => Share.share({ message: run.output })} />
          </View>
        </Row>
      </Card>

      {run.nextStep !== '' && (
        <Card style={{ backgroundColor: t.primaryBg, borderColor: t.primaryBg }}>
          <H2>Suggested next step</H2>
          <Body>{run.nextStep}</Body>
        </Card>
      )}

      {run.status === 'pending' && (
        <View style={{ gap: space.sm }}>
          <Button title="Approve" icon="checkmark-circle" onPress={() => decide('approved')} />
          <Button title="Reject" icon="close-circle" variant="danger" onPress={() => decide('rejected')} />
        </View>
      )}

      <Card>
        <H2>What the agent was given</H2>
        <Body muted>{run.input}</Body>
      </Card>
      <Body muted style={{ fontSize: 12, textAlign: 'center' }}>AI-generated. Check facts, prices and names before sending.</Body>
    </Screen>
  );
}
