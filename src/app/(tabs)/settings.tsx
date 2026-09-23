import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import { Body, Card, H2, type IconName, Screen } from '@/components/ui';
import { DEMO_MODE, PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from '@/lib/config';
import { usePlan } from '@/lib/plan';
import { purchasesEnabled, restore } from '@/lib/purchases';
import { useStore } from '@/lib/store';
import { space, useTheme } from '@/lib/theme';

function Item({ icon, label, detail, onPress, danger }: { icon: IconName; label: string; detail?: string; onPress: () => void; danger?: boolean }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, opacity: pressed ? 0.6 : 1 })}
    >
      <Ionicons name={icon} size={20} color={danger ? t.danger : t.primary} />
      <Text style={{ flex: 1, color: danger ? t.danger : t.text, fontSize: 16 }}>{label}</Text>
      {detail && <Text style={{ color: t.textMuted }}>{detail}</Text>}
      <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
    </Pressable>
  );
}

export default function Settings() {
  const plan = usePlan();
  const business = useStore((s) => s.business);
  const [restoring, setRestoring] = useState(false);

  const onRestore = async () => {
    setRestoring(true);
    try {
      const ok = await restore();
      Alert.alert(ok ? 'Purchases restored' : 'No active subscription found');
    } catch (e) {
      Alert.alert('Restore failed', (e as Error).message);
    } finally {
      setRestoring(false);
    }
  };

  const onReset = () =>
    Alert.alert('Delete all data?', 'This removes your business profile, agents and history from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => useStore.getState().resetAll() },
    ]);

  return (
    <Screen>
      {DEMO_MODE && (
        <Card>
          <H2>Demo mode</H2>
          <Body muted>No server is configured, so agents return sample output. Set EXPO_PUBLIC_API_URL to go live.</Body>
        </Card>
      )}
      <View>
        <Body muted>Business</Body>
        <Item icon="storefront" label={business.name} detail="Edit" onPress={() => router.push('/profile')} />
      </View>
      <View>
        <Body muted>Subscription</Body>
        <Item
          icon="rocket"
          label={plan.isPro ? 'AgentDeck Pro' : 'Upgrade to Pro'}
          detail={`${plan.used}/${plan.limit} runs`}
          onPress={() => router.push('/paywall')}
        />
        {purchasesEnabled && (
          <Item icon="refresh" label={restoring ? 'Restoring…' : 'Restore purchases'} onPress={onRestore} />
        )}
      </View>
      <View>
        <Body muted>About</Body>
        <Item icon="shield-checkmark" label="Privacy policy" onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)} />
        <Item icon="document-text" label="Terms of use" onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)} />
        <Item icon="mail" label="Contact support" onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} />
        <Item icon="trash" label="Delete all data" onPress={onReset} danger />
      </View>
    </Screen>
  );
}
