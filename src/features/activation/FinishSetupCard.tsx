import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { APP_HREFS } from '@/src/linking/appHrefs';

import { useActivationStatus } from './useActivationStatus';

/**
 * Soft-activated athletes who still need data (or skipped connect) get one setup surface
 * instead of a pile of empty Today glances.
 */
export function FinishSetupCard() {
  const { data } = useActivationStatus();

  if (!data?.supportsActivation) return null;
  if (!data.softActivated || data.fullyActivated) return null;

  return (
    <View
      testID="finish-setup-card"
      className="mb-4 rounded-2xl border border-border bg-card px-4 py-4"
    >
      <Text className="text-lg font-semibold text-text-primary">Finish setup</Text>
      <Text className="mt-1 text-sm text-text-muted">
        Connect Health Sync or a wearable so Today’s coaching uses your real recovery and training
        data. You can skip and come back anytime.
      </Text>
      <View className="mt-4 gap-2">
        <Button
          label="Health Sync"
          onPress={() => router.push(APP_HREFS.settingsHealth as Href)}
        />
        <Button
          variant="secondary"
          label="Connected Apps"
          onPress={() => router.push(APP_HREFS.settingsConnectedApps as Href)}
        />
        <Button
          variant="secondary"
          label="Open setup wizard"
          onPress={() => router.push('/(activation)/connect' as Href)}
        />
      </View>
    </View>
  );
}
