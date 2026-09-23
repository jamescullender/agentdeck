import { router } from 'expo-router';

import { BusinessForm } from '@/components/BusinessForm';
import { Screen } from '@/components/ui';
import { useStore } from '@/lib/store';

export default function Profile() {
  const business = useStore((s) => s.business);
  const saveBusiness = useStore((s) => s.saveBusiness);
  return (
    <Screen>
      <BusinessForm
        initial={business}
        submitLabel="Save"
        onSubmit={(b) => {
          saveBusiness(b);
          router.back();
        }}
      />
    </Screen>
  );
}
