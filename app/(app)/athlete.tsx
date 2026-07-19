import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';
import {
  absoluteInstanceUrl,
  emptyAthleteForm,
  formFromAthleteProfile,
  formHasInvalidNumbers,
  patchHasFields,
  profileSettingsWebPath,
  toAthleteMetricsPatch,
  weightUnitLabel,
} from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery, usePatchAthleteMetrics } from '@/src/features/profile/useProfile';
import type { AthleteMetricsFormValues } from '@/src/features/profile/types';
import { Colors } from '@/src/theme/colors';

export default function AthleteMetricsScreen() {
  const { instanceUrl, refreshUser } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useAthleteProfileQuery();
  const saveMutation = usePatchAthleteMetrics();

  const [values, setValues] = useState<AthleteMetricsFormValues>(emptyAthleteForm());
  const [hydrated, setHydrated] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setValues(formFromAthleteProfile(data));
    setHydrated(true);
  }, [data]);

  const patch = <K extends keyof AthleteMetricsFormValues>(
    key: K,
    value: AthleteMetricsFormValues[K]
  ) => {
    setFormError(null);
    setSuccessMessage(null);
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const openWeb = async () => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(
      absoluteInstanceUrl(instanceUrl, profileSettingsWebPath())
    );
  };

  const onSave = async () => {
    if (!data) return;
    setFormError(null);
    setSuccessMessage(null);

    if (formHasInvalidNumbers(values)) {
      setFormError('Enter valid numbers for each metric you want to update.');
      return;
    }

    const body = toAthleteMetricsPatch(values, data.weightUnits);
    if (!patchHasFields(body)) {
      setFormError('Enter at least one metric to save.');
      return;
    }

    try {
      const updated = await saveMutation.mutateAsync(body);
      setValues(formFromAthleteProfile(updated));
      setSuccessMessage('Metrics saved.');
      try {
        await refreshUser();
      } catch {
        // userinfo refresh is best-effort; save already succeeded
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save metrics');
    }
  };

  const unit = data ? weightUnitLabel(data.weightUnits) : 'kg';
  const pending = saveMutation.isPending;

  return (
    <>
      <Stack.Screen options={{ title: 'Athlete', headerShown: true }} />
      {isLoading || (isFetching && !hydrated) ? (
        <View className="flex-1 items-center justify-center bg-surface-dark">
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : isError && !data ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {error instanceof Error ? error.message : 'Failed to load profile'}
          </Text>
          <Pressable
            className="mt-4 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
            onPress={() => void refetch()}
          >
            <Text className="text-base font-semibold text-white">Retry</Text>
          </Pressable>
          <Pressable
            className="mt-3 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
            onPress={() => void openWeb()}
          >
            <Text className="text-base font-semibold text-white">Open web</Text>
          </Pressable>
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1 bg-surface-dark"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 pb-10 pt-4"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-2xl font-semibold text-white">Athlete metrics</Text>
            <Text className="mt-2 text-sm text-ink-muted">
              Update core training numbers. Full Profile Settings stay on the web.
            </Text>

            <Field
              label={`Weight (${unit})`}
              value={values.weight}
              onChangeText={(text) => patch('weight', text)}
              keyboardType="decimal-pad"
              editable={!pending}
            />
            <Field
              label="FTP (W)"
              value={values.ftp}
              onChangeText={(text) => patch('ftp', text)}
              keyboardType="number-pad"
              editable={!pending}
            />
            <Field
              label="Max HR (bpm)"
              value={values.maxHr}
              onChangeText={(text) => patch('maxHr', text)}
              keyboardType="number-pad"
              editable={!pending}
            />
            <Field
              label="LTHR (bpm)"
              value={values.lthr}
              onChangeText={(text) => patch('lthr', text)}
              keyboardType="number-pad"
              editable={!pending}
            />

            {formError ? <Text className="mt-4 text-sm text-red-400">{formError}</Text> : null}
            {successMessage ? (
              <Text className="mt-4 text-sm text-emerald-400">{successMessage}</Text>
            ) : null}

            <Pressable
              className="mt-6 items-center rounded-xl bg-brand py-3.5 active:opacity-80"
              onPress={() => void onSave()}
              disabled={pending}
            >
              {pending ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text className="text-base font-semibold text-zinc-950">Save metrics</Text>
              )}
            </Pressable>

            <Pressable
              className="mt-3 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
              onPress={() => void openWeb()}
            >
              <Text className="text-base font-semibold text-white">Open web Profile Settings</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  editable,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType: 'decimal-pad' | 'number-pad';
  editable: boolean;
}) {
  return (
    <View className="mt-5">
      <Text className="text-xs uppercase tracking-wide text-ink-muted">{label}</Text>
      <TextInput
        className="mt-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-base text-white"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );
}
