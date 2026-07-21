import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { trackActivationEvent } from '@/src/features/activation/analytics';
import { activationIdentity, setConnectLater } from '@/src/features/activation/connectLater';
import {
  useActivationStatus,
  useInvalidateActivationStatus,
} from '@/src/features/activation/useActivationStatus';
import { APP_HREFS } from '@/src/linking/appHrefs';

export default function ActivationConnectScreen() {
  const router = useRouter();
  const { instanceUrl, user } = useAuth();
  const identity = activationIdentity(instanceUrl, user);
  const invalidate = useInvalidateActivationStatus();
  const activationQuery = useActivationStatus();
  const refetchActivation = activationQuery.refetch;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (connectionAttempted) void refetchActivation();
    }, [connectionAttempted, refetchActivation])
  );

  const finishSkip = async () => {
    setError(null);
    setBusy(true);
    try {
      if (!identity) throw new Error('Activation identity is unavailable');
      await setConnectLater(identity, true);
      trackActivationEvent('activation_connect_skipped');
      await invalidate();
      router.replace(APP_HREFS.today as Href);
    } catch (err) {
      setError(friendlyError(err, 'Could not continue'));
    } finally {
      setBusy(false);
    }
  };

  const finishConnection = async () => {
    setError(null);
    setBusy(true);
    try {
      if (!identity) throw new Error('Activation identity is unavailable');
      await setConnectLater(identity, false);
      const refreshed = await refetchActivation();
      trackActivationEvent('activation_connect_completed');
      if (refreshed.data?.fullyActivated) {
        trackActivationEvent('activation_fully_activated');
      }
      router.replace(APP_HREFS.today as Href);
    } catch (err) {
      setError(friendlyError(err, 'Could not finish connection setup'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-6 pb-10 pt-2">
        <Text className="text-2xl font-semibold text-text-primary">Connect your data</Text>
        <Text className="mt-2 text-base text-text-muted">
          Optional — skip if you’re not ready. Health Sync uses this phone (no Strava password).
          Wearables can connect via Connected Apps.
        </Text>

        <View className="mt-8 gap-3">
          <Button
            label="Set up Health Sync"
            onPress={() => {
              setConnectionAttempted(true);
              router.push(APP_HREFS.settingsHealth as Href);
            }}
          />
          <Button
            variant="secondary"
            label="Connected Apps"
            onPress={() => {
              setConnectionAttempted(true);
              router.push(APP_HREFS.settingsConnectedApps as Href);
            }}
          />
          {connectionAttempted ? (
            <Button
              variant="secondary"
              label="Continue to Today"
              loading={busy}
              onPress={() => void finishConnection()}
            />
          ) : null}
          <Button
            variant="secondary"
            label="Skip for now"
            loading={busy}
            onPress={() => void finishSkip()}
          />
        </View>

        {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

        <Text className="mt-8 text-sm text-text-muted">
          You can finish setup anytime from Today. Your plan already works without a device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
