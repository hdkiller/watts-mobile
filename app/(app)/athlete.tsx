/* Hallmark · pre-emit critique: P5 H4 E5 S5 R5 V4 */
/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app */
import { useQueryClient } from '@tanstack/react-query';
import { Stack, router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { AppSymbol } from '@/src/components/AppSymbol';
import { Button } from '@/src/components/Button';
import { Skeleton, SkeletonScreen } from '@/src/components/Skeleton';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { GoalsLiteSection } from '@/src/features/goals/GoalsLiteSection';
import { AthleteProfileOverview } from '@/src/features/profile/AthleteProfileOverview';
import {
  athleteProfileWebPath,
  emptyAthleteForm,
  formFromAthleteProfile,
  formHasInvalidNumbers,
  patchHasFields,
  profileSettingsWebPath,
  toAthleteMetricsPatch,
  weightUnitLabel,
} from '@/src/features/profile/mapProfile';
import type { AthleteMetricsFormValues, AthleteProfile } from '@/src/features/profile/types';
import { ATHLETE_PROFILE_KEY, useAthleteProfileQuery, usePatchAthleteMetrics } from '@/src/features/profile/useProfile';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';

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
  const [metricsOpen, setMetricsOpen] = useState(false);

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
      hapticError();
      setFormError('Enter valid numbers for each metric you want to update.');
      return;
    }

    const body = toAthleteMetricsPatch(values, data.weightUnits);
    if (!patchHasFields(body)) {
      hapticError();
      setFormError('Enter at least one metric to save.');
      return;
    }

    try {
      const updated = await saveMutation.mutateAsync(body);
      setValues(formFromAthleteProfile(updated));
      setSuccessMessage('Metrics saved.');
      hapticSuccess();
      try {
        await refreshUser();
      } catch {
        // userinfo refresh is best-effort; save already succeeded
      }
    } catch (err) {
      hapticError();
      setFormError(friendlyError(err, 'Failed to save metrics'));
    }
  };

  const unit = data ? weightUnitLabel(data.weightUnits) : 'kg';
  const pending = saveMutation.isPending;

  return (
    <>
      <Stack.Screen options={{ title: 'Athlete', headerShown: true }} />
      {isLoading && !data ? (
        <AthleteScreenSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <View className="rounded-xl border border-danger/40 bg-tint-error px-4 py-4">
            <Text className="text-sm text-red-400">
              {friendlyError(error, 'Failed to load profile')}
            </Text>
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Retry loading profile"
              className="mt-3 self-start"
              hitSlop={8}
              onPress={() => {
                hapticLight();
                void refetch();
              }}
            >
              <Text className="text-sm font-semibold text-brand">Retry</Text>
            </AnimatedPressable>
          </View>
          <Button
            className="mt-4"
            variant="secondary"
            label="Open Coach Watts"
            onPress={() => void openWebReport()}
          />
        </View>
      ) : (
        <View ref={containerRef} testID="athlete-screen" className="flex-1 bg-surface">
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

            <GoalsLiteSection />

            <View className="mt-8">
              <AnimatedPressable
                accessibilityRole="button"
                accessibilityState={{ expanded: metricsOpen }}
                accessibilityLabel={metricsOpen ? 'Hide edit metrics' : 'Show edit metrics'}
                className="flex-row items-center justify-between py-1"
                hitSlop={8}
                onPress={() => {
                  hapticLight();
                  setMetricsOpen((open) => !open);
                }}
              >
                <Text className="text-xl font-semibold text-text-primary">Edit metrics</Text>
                <AppSymbol
                  sf={metricsOpen ? 'chevron.down' : 'chevron.right'}
                  size={18}
                  tintColor={theme.textMuted}
                />
              </AnimatedPressable>

              {metricsOpen ? (
                <View className="mt-2">
                  <Text className="text-sm text-text-muted">
                    Default sport profile — per-sport thresholds live in{' '}
                    <Text
                      className="font-semibold text-brand"
                      onPress={() => router.push(APP_HREFS.settingsSports as Href)}
                    >
                      Sports
                    </Text>
                    .
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

                  {formError ? (
                    <View className="mt-4 rounded-xl border border-danger/40 bg-tint-error px-4 py-3">
                      <Text className="text-sm text-red-400">{formError}</Text>
                    </View>
                  ) : null}
                  {successMessage ? (
                    <Text className="mt-4 text-sm text-success">{successMessage}</Text>
                  ) : null}

                  <Button
                    className="mt-6"
                    label="Save metrics"
                    loading={pending}
                    onPress={() => void onSave()}
                  />

                  <Button
                    className="mt-3"
                    variant="secondary"
                    label="Open Profile Settings"
                    onPress={() => void openWebSettings()}
                  />
                </View>
              ) : (
                <Text className="mt-2 text-sm text-text-muted">
                  Weight, FTP, and heart-rate defaults — expand to edit.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
}

function AthleteScreenSkeleton() {
  return (
    <SkeletonScreen>
      <View className="flex-1 bg-surface px-6 pt-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-2 h-4 w-20" />
        <View className="mt-5 flex-row gap-4">
          <Skeleton className="h-16 w-28 rounded-xl" />
          <View className="flex-1 justify-center gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </View>
        </View>
        <Skeleton className="mt-5 h-36 rounded-xl" />
        <Skeleton className="mt-6 h-28 rounded-2xl" />
        <Skeleton className="mt-8 h-7 w-40" />
      </View>
    </SkeletonScreen>
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
