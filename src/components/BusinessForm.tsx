import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button, Field } from '@/components/ui';
import type { BusinessProfile, Tone } from '@/lib/store';
import { radius, space, useTheme } from '@/lib/theme';

const TONES: Tone[] = ['friendly', 'professional', 'playful', 'formal'];

export function BusinessForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: BusinessProfile;
  submitLabel: string;
  onSubmit: (b: BusinessProfile) => void;
}) {
  const t = useTheme();
  const [b, setB] = useState(initial);
  const set = (patch: Partial<BusinessProfile>) => setB((prev) => ({ ...prev, ...patch }));

  return (
    <View style={{ gap: space.lg }}>
      <Field label="Business name" value={b.name} onChangeText={(name) => set({ name })} placeholder="e.g. Harbour Coffee Co." />
      <Field label="Industry" value={b.industry} onChangeText={(industry) => set({ industry })} placeholder="e.g. Café, plumbing, salon" />
      <Field label="Location" value={b.location} onChangeText={(location) => set({ location })} placeholder="e.g. Chelmsford, Essex" />
      <Field
        label="What should your agents know?"
        hint="Services, prices, opening hours, policies. The more detail, the better the drafts."
        value={b.description}
        onChangeText={(description) => set({ description })}
        multiline
        placeholder="We're open Tue–Sun 8am–4pm. Flat whites £3.40…"
      />
      <View style={{ gap: space.xs }}>
        <Text style={{ color: t.text, fontSize: 14, fontWeight: '600' }}>Tone of voice</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {TONES.map((tone) => {
            const on = b.tone === tone;
            return (
              <Pressable
                key={tone}
                onPress={() => set({ tone })}
                accessibilityState={{ selected: on }}
                style={{
                  paddingHorizontal: space.lg,
                  paddingVertical: space.sm,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: on ? t.primary : t.border,
                  backgroundColor: on ? t.primaryBg : t.surface,
                }}
              >
                <Text style={{ color: on ? t.primary : t.text, fontWeight: '600', textTransform: 'capitalize' }}>{tone}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Field label="Sign-off" value={b.signOff} onChangeText={(signOff) => set({ signOff })} placeholder="e.g. Sam & the Harbour team" />
      <Button title={submitLabel} onPress={() => onSubmit(b)} disabled={b.name.trim() === ''} />
    </View>
  );
}
