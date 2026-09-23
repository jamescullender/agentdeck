import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { RunRow } from '@/components/RunRow';
import { Empty, Screen } from '@/components/ui';
import { useStore } from '@/lib/store';
import { radius, space, useTheme } from '@/lib/theme';

type Filter = 'pending' | 'all';

export default function Inbox() {
  const t = useTheme();
  const runs = useStore((s) => s.runs);
  const [filter, setFilter] = useState<Filter>('pending');
  const shown = filter === 'pending' ? runs.filter((r) => r.status === 'pending') : runs;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', backgroundColor: t.surfaceAlt, borderRadius: radius.md, padding: 3 }}>
        {(['pending', 'all'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            accessibilityState={{ selected: filter === f }}
            style={{
              flex: 1,
              paddingVertical: space.sm,
              borderRadius: radius.sm,
              alignItems: 'center',
              backgroundColor: filter === f ? t.surface : 'transparent',
            }}
          >
            <Text style={{ color: t.text, fontWeight: '600' }}>{f === 'pending' ? 'Needs review' : 'All activity'}</Text>
          </Pressable>
        ))}
      </View>
      {shown.length === 0 ? (
        <Empty
          icon="checkmark-done-circle"
          title={filter === 'pending' ? 'All caught up' : 'No activity yet'}
          body={filter === 'pending' ? 'New drafts from your agents will appear here for approval.' : 'Run an agent to get started.'}
        />
      ) : (
        shown.map((r) => <RunRow key={r.id} run={r} />)
      )}
    </Screen>
  );
}
