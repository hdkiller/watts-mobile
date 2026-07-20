import { useQueryClient } from '@tanstack/react-query';
import { Stack, router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AthleteProfileOverview } from '@/src/features/profile/AthleteProfileOverview';
import {
  athleteProfileWebPath,
  emptyAthleteForm,
  formFromAthleteProfile,
  formHasInvalidNumbers,
  patchHasFields,
  profileSettingsWebPath,
  toAthleteMetricsPatch,
  weightUnitLabel } from '@/src/features/profile/mapProfile';
import { ATHLETE_PROFILE_KEY, useAthleteProfileQuery, usePatchAthleteMetrics } from '@/src/features/profile/useProfile';
import type { AthleteMetricsFormValues, AthleteProfile } from '@/src/features/profile/types';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';

export default function AthleteMetricsScreen() {
  const theme = useThemeColors();

  const queryClient = useQueryClient();
  const { instanceUrl, refreshUser, signIn } = useAuth();
  const { data, isLoading, isError, error, refetch } = useAthleteProfileQuery();
  const saveMutation = usePatchAthleteMetrics();
  const { containerRef, overlap } = useKeyboardOverlap();

  const [values, setValues] = useState<AthleteMetricsFormValues>(() => {
    const cached = queryClient.getQueryData<AthleteProfile>(ATHLETE_PROFILE_KEY);
    return cached ? formFromAthleteProfile(cached) : emptyAthleteForm();
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setValues(formFromAthleteProfile(data));
  }, [data]);

  const patch = <K extends keyof AthleteMetricsFormValues>(
    key: K,
    value: AthleteMetricsFormValues[K]
  ) => {
    setFormError(null);
    setSuccessMessage(null);
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const openWebSettings = async () => {
    await openInstanceWeb(instanceUrl, profileSettingsWebPath());
  };

  const openWebReport = async () => {
    await openInstanceWeb(instanceUrl, athleteProfileWebPath());
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
      setFormError(friendlyError(err, 'Failed to save metrics'));
    }
  };

  const unit = data ? weightUnitLabel(data.weightUnits) : 'kg';
  const pending = saveMutation.isPending;

  return (
    <>
      <Stack.Screen options={{ title: 'Athlete', headerShown: true }} />
      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center bg-surface">
          <ActivityIndicator color={Colors.brand} size="large" />
        </View>
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load profile')}
          </Text>
          <Pressable
            className="mt-4 items-center rounded-xl border border-border-strong py-3.5 active:opacity-80"
            onPress={() => void refetch()}
          >
            <Text className="text-base font-semibold text-text-primary">Retry</Text>
          </Pressable>
          <Pressable
            className="mt-3 items-center rounded-xl border border-border-strong py-3.5 active:opacity-80"
            onPress={() => void openWebReport()}
          >
            <Text className="text-base font-semibold text-text-primary">Open web</Text>
          </Pressable>
        </View>
      ) : (
        <View ref={containerRef} className="flex-1 bg-surface">
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 pt-4"
            contentContainerStyle={{ paddingBottom: 40 + overlap }}
            keyboardShouldPersistTaps="handled"
          >
            {data ? (
              <AthleteProfileOverview
                profile={data}
                onOpenWebReport={() => void openWebReport()}
                // Scope drift: re-run PKCE in place (usually one tap via the live browser
                // session), then refetch — never sign the athlete out for this (issue 059).
                onReauth={() =>
                  void signIn()
                    .then(() => queryClient.invalidateQueries())
                    .catch(() => {})
                }
              />
            ) : null}

            <Text className="text-xl font-semibold text-text-primary">Edit metrics</Text>
            <Text className="mt-2 text-sm text-text-muted">
              Default sport profile — per-sport thresholds live in{' '}
              <Text
                className="font-semibold text-brand"
                onPress={() => router.push('/(app)/(tabs)/more/settings/sports' as Href)}
              >
                Sports
              </Text>
              ; advanced settings stay on the web.
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
                <ActivityIndicator color={theme.surface} />
              ) : (
                <Text className="text-base font-semibold text-ink">Save metrics</Text>
              )}
            </Pressable>

            <Pressable
              className="mt-3 items-center rounded-xl border border-border-strong py-3.5 active:opacity-80"
              onPress={() => void openWebSettings()}
            >
              <Text className="text-base font-semibold text-text-primary">Open web Profile Settings</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  editable }: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType: 'decimal-pad' | 'number-pad';
  editable: boolean;
}) {
  const theme = useThemeColors();
  return (
    <View className="mt-5">
      <Text className="text-xs uppercase tracking-wide text-text-muted">{label}</Text>
      <TextInput
        className="mt-2 rounded-xl border border-border-strong bg-card/80 px-4 py-3 text-base text-text-primary"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
        placeholderTextColor={theme.textMuted}
      />
    </View>
  );
}
