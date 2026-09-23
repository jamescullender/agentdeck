import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { BusinessForm } from '@/components/BusinessForm';
import { Body, Button, Card, H1, H2, Screen } from '@/components/ui';
import { PRIVACY_URL } from '@/lib/config';
import { EMPTY_BUSINESS, useStore, type BusinessProfile } from '@/lib/store';
import { space, useTheme } from '@/lib/theme';

type Step = 'welcome' | 'business' | 'consent';

export default function Onboarding() {
  const t = useTheme();
  const [step, setStep] = useState<Step>('welcome');
  const [draft, setDraft] = useState<BusinessProfile>(EMPTY_BUSINESS);
  const [agreed, setAgreed] = useState(false);
  const { saveBusiness, giveConsent, addAgent } = useStore.getState();

  const finish = () => {
    saveBusiness(draft);
    // Seed one agent so the dashboard isn't empty on first launch.
    if (useStore.getState().agents.length === 0) addAgent('reviews');
    giveConsent();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Screen>
          {step === 'welcome' && (
            <View style={{ gap: space.xl, paddingTop: space.xl }}>
              <View style={{ gap: space.sm }}>
                <Ionicons name="grid" size={44} color={t.primary} />
                <H1>Your AI team, in one control panel</H1>
                <Body muted>
                  AgentDeck gives your business AI agents that draft review replies, answer enquiries, chase invoices and
                  write your social posts, and nothing goes out until you approve it.
                </Body>
              </View>
              {[
                ['flash', 'Ready-made agents', 'Pick from agents built for small-business jobs.'],
                ['checkmark-done', 'You stay in control', 'Every draft lands in your inbox for approval.'],
                ['time', 'Hours back every week', 'See how much time your agents save you.'],
              ].map(([icon, title, body]) => (
                <View key={title} style={{ flexDirection: 'row', gap: space.md }}>
                  <Ionicons name={icon as 'flash'} size={24} color={t.primary} />
                  <View style={{ flex: 1 }}>
                    <H2>{title}</H2>
                    <Body muted>{body}</Body>
                  </View>
                </View>
              ))}
              <Button title="Set up my business" onPress={() => setStep('business')} />
            </View>
          )}

          {step === 'business' && (
            <>
              <H1>Tell your agents about your business</H1>
              <BusinessForm
                initial={draft}
                submitLabel="Continue"
                onSubmit={(b) => {
                  setDraft(b);
                  setStep('consent');
                }}
              />
            </>
          )}

          {step === 'consent' && (
            <>
              <H1>How your data is used</H1>
              <Card>
                <Body>
                  To do their work, your agents send your business profile and the text you give them (for example, a
                  customer review or email) to Anthropic’s Claude AI service.
                </Body>
                <Body muted>
                  Anthropic processes this data to generate a response and does not use it to train its models. Your
                  agents, drafts and history are otherwise stored only on this device.
                </Body>
                <Pressable onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}>
                  <Text style={{ color: t.primary, fontWeight: '600' }}>Read our privacy policy</Text>
                </Pressable>
              </Card>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreed }}
                onPress={() => setAgreed(!agreed)}
                style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}
              >
                <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={26} color={t.primary} />
                <Body style={{ flex: 1 }}>I agree to share this data with Anthropic so my agents can work.</Body>
              </Pressable>
              <Button title="Start using AgentDeck" onPress={finish} disabled={!agreed} />
              <Button title="Back" variant="secondary" onPress={() => setStep('business')} />
            </>
          )}
        </Screen>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
