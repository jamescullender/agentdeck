import * as Haptics from 'expo-haptics';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Switch, View } from 'react-native';

import { RunRow } from '@/components/RunRow';
import { AgentIcon, Body, Button, Card, Field, H1, H2, Row, Screen } from '@/components/ui';
import { QuotaError, runAgent } from '@/lib/api';
import { usePlan } from '@/lib/plan';
import { uid, useStore } from '@/lib/store';
import { getTemplate } from '@/lib/templates';
import { space, useTheme } from '@/lib/theme';

export default function AgentDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const agent = useStore((s) => s.agents.find((a) => a.id === id));
  const allRuns = useStore((s) => s.runs);
  const runs = allRuns.filter((r) => r.agentId === id);
  const { updateAgent, deleteAgent, addRun } = useStore.getState();
  const plan = usePlan();
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);

  if (!agent) return <Screen><Body muted>This agent no longer exists.</Body></Screen>;
  const tpl = getTemplate(agent.templateId);

  const run = async () => {
    if (plan.outOfRuns) {
      router.push('/paywall');
      return;
    }
    setRunning(true);
    try {
      const result = await runAgent(agent, useStore.getState().business, input.trim());
      const runId = uid();
      addRun({
        id: runId,
        agentId: agent.id,
        input: input.trim(),
        status: agent.requireApproval ? 'pending' : 'completed',
        ...result,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInput('');
      router.push(`/run/${runId}`);
    } catch (e) {
      if (e instanceof QuotaError) router.push('/paywall');
      else Alert.alert('The agent couldn’t finish', (e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert(`Delete ${agent.name}?`, 'Its history will be removed too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          router.back();
          deleteAgent(agent.id);
        },
      },
    ]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: agent.name }} />
      <Screen>
        <Row>
          <AgentIcon icon={tpl.icon} color={tpl.color} size={52} />
          <View style={{ flex: 1 }}>
            <H1>{agent.name}</H1>
            <Body muted>{tpl.tagline}</Body>
          </View>
        </Row>

        <Card>
          <Field
            label={tpl.inputLabel}
            value={input}
            onChangeText={setInput}
            placeholder={tpl.inputPlaceholder}
            multiline
            maxLength={8000}
          />
          <Button
            title={agent.enabled ? 'Run agent' : 'Agent is paused'}
            icon="play"
            onPress={run}
            loading={running}
            disabled={!agent.enabled || input.trim().length < 3}
          />
        </Card>

        <View style={{ gap: space.md }}>
          <H2>Settings</H2>
          <Card>
            <Field label="Name" value={agent.name} onChangeText={(name) => updateAgent(agent.id, { name })} />
            <Field
              label="Extra instructions"
              hint="Rules this agent should always follow, e.g. “Always offer 10% off the next visit to unhappy customers.”"
              value={agent.instructions}
              onChangeText={(instructions) => updateAgent(agent.id, { instructions })}
              multiline
              maxLength={2000}
            />
            <Row style={{ justifyContent: 'space-between', paddingTop: space.sm }}>
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: '600' }}>Require my approval</Body>
                <Body muted style={{ fontSize: 13 }}>Drafts wait in your Inbox until you approve them.</Body>
              </View>
              <Switch
                value={agent.requireApproval}
                onValueChange={(requireApproval) => updateAgent(agent.id, { requireApproval })}
                trackColor={{ true: t.primary }}
              />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Body style={{ fontWeight: '600', flex: 1 }}>Active</Body>
              <Switch value={agent.enabled} onValueChange={(enabled) => updateAgent(agent.id, { enabled })} trackColor={{ true: t.primary }} />
            </Row>
          </Card>
        </View>

        {runs.length > 0 && (
          <View style={{ gap: space.sm }}>
            <H2>History</H2>
            {runs.slice(0, 20).map((r) => (
              <RunRow key={r.id} run={r} />
            ))}
          </View>
        )}

        <Button title="Delete agent" variant="danger" icon="trash" onPress={confirmDelete} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
