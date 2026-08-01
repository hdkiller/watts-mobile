/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/src/features/account/paths';
import { trackActivationEvent } from '@/src/features/activation/analytics';
import { POLICY_VERSIONS, submitConsent } from '@/src/features/activation/api';
import { useAdvanceActivationStatus } from '@/src/features/activation/useActivationStatus';

// Human-readable disclosure of the HealthKit / Health Connect record types
// read for coaching (see src/features/health/syncPermissions.ts for the exact
// native identifiers). Kept local to this screen — it's the only place that
// needs a user-facing label per type; syncPermissions.ts stays type-only.
const HEALTH_DATA_TYPES_READ = [
  'Body weight & body fat percentage',
  'Sleep',
  'Heart rate & resting heart rate',
  'Heart rate variability (HRV)',
  'Blood oxygen (SpO2) & respiratory rate',
  'VO2 max',
  'Steps & flights climbed',
  'Active & resting calories burned',
  'Distance (walking, running, cycling, swimming, wheelchair)',
  'Cycling & running power, cadence, and speed',
  'Workouts, including GPS routes',
];

export default function ActivationConsentScreen() {
  const router = useRouter();
  const advance = useAdvanceActivationStatus();
  const [terms, setTerms] = useState(false);
  const [health, setHealth] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHealthDataTypes, setShowHealthDataTypes] = useState(false);

  const onContinue = async () => {
    setError(null);
    setBusy(true);
    try {
      await submitConsent({
        termsVersion: POLICY_VERSIONS.terms,
        privacyPolicyVersion: POLICY_VERSIONS.privacy,
      });
      trackActivationEvent('activation_consent_completed');
      await advance({ mobileActivationStep: 'goal' });
      router.replace('/(activation)/goal');
    } catch (err) {
      setError(friendlyError(err, 'Could not save consent'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-6 pb-10 pt-2">
        <Text className="text-2xl font-semibold text-text-primary">Before we coach you</Text>
        <Text className="mt-2 text-base text-text-muted">
          Coach Watts processes training and health-related data to personalize recommendations.
          Please review and accept to continue.
        </Text>

        <View className="mt-8 gap-4">
          <View className="flex-row items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <View className="flex-1">
              <Text className="text-base font-medium text-text-primary">Terms & privacy</Text>
              <Text className="mt-1 text-sm text-text-muted">
                I accept the{' '}
                <Text
                  className="text-brand"
                  onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}
                >
                  Terms
                </Text>{' '}
                and{' '}
                <Text
                  className="text-brand"
                  onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
            <Switch value={terms} onValueChange={setTerms} />
          </View>

          <View className="rounded-xl border border-border bg-card p-4">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text className="text-base font-medium text-text-primary">Health data</Text>
                <Text className="mt-1 text-sm text-text-muted">
                  I consent to processing health and biometric data for coaching.
                </Text>
              </View>
              <Switch value={health} onValueChange={setHealth} />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: showHealthDataTypes }}
              className="mt-3"
              onPress={() => setShowHealthDataTypes((prev) => !prev)}
            >
              <Text className="text-sm font-medium text-brand">
                {showHealthDataTypes ? 'Hide what we read' : 'What we read'}
              </Text>
            </Pressable>

            {showHealthDataTypes ? (
              <View className="mt-2 gap-1.5">
                {HEALTH_DATA_TYPES_READ.map((label) => (
                  <Text key={label} className="text-sm text-text-muted">
                    {'•'} {label}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        {error ? <Text className="mt-4 text-sm text-danger">{error}</Text> : null}

        <Button
          className="mt-8"
          label="Continue"
          disabled={!terms || !health}
          loading={busy}
          onPress={() => void onContinue()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
