import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { Body, Button, Card, H1, H2, Row, Screen } from '@/components/ui';
import { refreshUsage } from '@/lib/api';
import { PLAN_LIMITS, PRIVACY_URL, TERMS_URL } from '@/lib/config';
import { usePlan } from '@/lib/plan';
import { buy, getPackages, purchasesEnabled, restore } from '@/lib/purchases';
import { radius, space, useTheme } from '@/lib/theme';

const FEATURES = [
  ['infinite', 'Unlimited agents', `Free includes ${PLAN_LIMITS.free.agents}`],
  ['flash', `${PLAN_LIMITS.pro.runsPerMonth} agent runs a month`, `Free includes ${PLAN_LIMITS.free.runsPerMonth}`],
  ['chatbubbles', 'Priority support', 'Direct email help from the team behind AgentDeck'],
] as const;

const PERIOD: Record<string, string> = { ANNUAL: 'year', MONTHLY: 'month', WEEKLY: 'week', SIX_MONTH: '6 months', THREE_MONTH: '3 months' };

export default function Paywall() {
  const t = useTheme();
  const plan = usePlan();
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPackages()
      .then((p) => {
        setPackages(p);
        setSelected(p.find((x) => x.packageType === 'ANNUAL')?.identifier ?? p[0]?.identifier ?? null);
      })
      .catch(() => setPackages([]));
  }, []);

  const purchase = async () => {
    const pkg = packages?.find((p) => p.identifier === selected);
    if (!pkg) return;
    setBusy(true);
    try {
      if (await buy(pkg)) {
        await refreshUsage();
        router.back();
      }
    } catch (e) {
      Alert.alert('Purchase failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setBusy(true);
    try {
      if (await restore()) {
        await refreshUsage();
        router.back();
      } else Alert.alert('No active subscription found');
    } catch (e) {
      Alert.alert('Restore failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (plan.isPro) {
    return (
      <Screen>
        <H1>You’re on Pro</H1>
        <Body muted>Manage or cancel your subscription in your App Store or Google Play account settings.</Body>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <Ionicons name="rocket" size={44} color={t.primary} />
        <H1>AgentDeck Pro</H1>
        <Body muted style={{ textAlign: 'center' }}>
          {plan.outOfRuns ? 'You’ve used all your free runs this month.' : 'Put your whole AI team to work.'}
        </Body>
      </View>

      <Card>
        {FEATURES.map(([icon, title, sub]) => (
          <Row key={title} style={{ paddingVertical: 4 }}>
            <Ionicons name={icon} size={22} color={t.primary} />
            <View style={{ flex: 1 }}>
              <Body style={{ fontWeight: '600' }}>{title}</Body>
              <Body muted style={{ fontSize: 13 }}>{sub}</Body>
            </View>
          </Row>
        ))}
      </Card>

      {!purchasesEnabled ? (
        <Card>
          <H2>Subscriptions not configured</H2>
          <Body muted>Add your RevenueCat keys (EXPO_PUBLIC_RC_IOS_KEY / EXPO_PUBLIC_RC_ANDROID_KEY) and use a development build to test purchases.</Body>
        </Card>
      ) : packages === null ? (
        <ActivityIndicator color={t.primary} />
      ) : packages.length === 0 ? (
        <Body muted style={{ textAlign: 'center' }}>No plans available right now. Please try again later.</Body>
      ) : (
        <View style={{ gap: space.sm }}>
          {packages.map((p) => {
            const on = p.identifier === selected;
            const period = PERIOD[p.packageType] ?? '';
            return (
              <Pressable
                key={p.identifier}
                onPress={() => setSelected(p.identifier)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={{
                  borderWidth: 2,
                  borderColor: on ? t.primary : t.border,
                  backgroundColor: t.surface,
                  borderRadius: radius.lg,
                  padding: space.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                }}
              >
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={t.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>
                    {p.packageType === 'ANNUAL' ? 'Yearly' : p.packageType === 'MONTHLY' ? 'Monthly' : p.product.title}
                  </Text>
                  {p.product.introPrice && (
                    <Text style={{ color: t.success, fontSize: 13 }}>
                      {p.product.introPrice.price === 0 ? `${p.product.introPrice.periodNumberOfUnits}-${p.product.introPrice.periodUnit.toLowerCase()} free trial` : 'Intro offer'}
                    </Text>
                  )}
                </View>
                <Text style={{ color: t.text, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
                  {p.product.priceString}
                  {period && <Text style={{ color: t.textMuted, fontWeight: '400' }}>/{period}</Text>}
                </Text>
              </Pressable>
            );
          })}
          <Button title="Continue" onPress={purchase} loading={busy} disabled={!selected} />
        </View>
      )}

      <Body muted style={{ fontSize: 12, textAlign: 'center' }}>
        Subscriptions renew automatically at the price shown unless cancelled at least 24 hours before the end of the
        current period. Manage or cancel any time in your store account settings.
      </Body>
      <Row style={{ justifyContent: 'center', gap: space.xl }}>
        {purchasesEnabled && (
          <Text style={{ color: t.primary }} onPress={onRestore}>
            Restore
          </Text>
        )}
        <Text style={{ color: t.primary }} onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}>
          Terms
        </Text>
        <Text style={{ color: t.primary }} onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}>
          Privacy
        </Text>
      </Row>
    </Screen>
  );
}
