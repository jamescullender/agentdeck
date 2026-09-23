import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { AgentIcon, Body, Card, H2, Row, Screen } from '@/components/ui';
import { usePlan } from '@/lib/plan';
import { useStore } from '@/lib/store';
import { TEMPLATES } from '@/lib/templates';
import { useTheme } from '@/lib/theme';

export default function NewAgent() {
  const t = useTheme();
  const plan = usePlan();
  const addAgent = useStore((s) => s.addAgent);

  const pick = (templateId: string) => {
    if (!plan.canAddAgent) {
      router.replace('/paywall');
      return;
    }
    const agent = addAgent(templateId);
    router.dismiss();
    router.push(`/agent/${agent.id}`);
  };

  return (
    <Screen>
      <Body muted>Each agent does one job well. You can customise its instructions after adding it.</Body>
      {TEMPLATES.map((tpl) => (
        <Card key={tpl.id} onPress={() => pick(tpl.id)}>
          <Row>
            <AgentIcon icon={tpl.icon} color={tpl.color} />
            <View style={{ flex: 1 }}>
              <H2>{tpl.name}</H2>
              <Body muted>{tpl.tagline}</Body>
            </View>
            <Ionicons name="add-circle" size={26} color={t.primary} />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
