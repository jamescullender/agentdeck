import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { refreshUsage } from '@/lib/api';
import { initPurchases } from '@/lib/purchases';
import { isOnboarded, useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function useHydrated() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  useEffect(() => useStore.persist.onFinishHydration(() => setHydrated(true)), []);
  return hydrated;
}

export default function RootLayout() {
  const t = useTheme();
  const hydrated = useHydrated();
  const onboarded = useStore(isOnboarded);

  useEffect(() => {
    initPurchases();
  }, []);

  useEffect(() => {
    if (hydrated && onboarded) refreshUsage();
  }, [hydrated, onboarded]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.primary,
          headerTitleStyle: { color: t.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="agent/new" options={{ title: 'Add an agent', presentation: 'modal' }} />
          <Stack.Screen name="agent/[id]" options={{ title: '' }} />
          <Stack.Screen name="run/[id]" options={{ title: 'Result' }} />
          <Stack.Screen name="profile" options={{ title: 'Business profile' }} />
          <Stack.Screen name="paywall" options={{ title: '', presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
