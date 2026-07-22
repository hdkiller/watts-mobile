import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import {
  displaySportName,
  formFromSportProfile,
  formHasInvalidNumbers,
  showThresholdPace,
  sportSettingsWebPath,
  toSportThresholdPatch } from '@/src/features/sports/mapSports';
import type { SportThresholdFormValues } from '@/src/features/sports/types';
import { usePatchSportThresholds, useSportProfilesQuery } from '@/src/features/sports/useSports';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticError, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';

export default function SportProfileEditorScreen() {
  const theme = useThemeColors();

  const params = useLocalSearchParams<{ id?: string }>();
  const profileId = typeof params.id === 'string' ? decodeURIComponent(params.id) : '';
  const { instanceUrl } = useAuth();
  const { data: profiles, isLoading, isError, error, refetch } = useSportProfilesQuery();
  const saveMutation = usePatchSportThresholds();
  const { containerRef, overlap } = useKeyboardOverlap();

  const profile = useMemo(
    () => profiles?.find((item) => item.id === profileId) ?? null,
    [profiles, profileId]
  );
  const includePace = profile ? showThresholdPace(profile) : false;

  const [values, setValues] = useState<SportThresholdFormValues>({
    ftp: '',
    lthr: '',
    maxHr: '',
    thresholdPace: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) setValues(formFromSportProfile(profile));
  }, [profile]);

  const patch = <K extends keyof SportThresholdFormValues>(
    key: K,
    value: SportThresholdFormValues[K]
  ) => {
    setFormError(null);
    setSuccessMessage(null);
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const openWeb = async () => {
    await openInstanceWeb(instanceUrl, sportSettingsWebPath());
  };

  const onSave = async () => {
    if (!profile) return;
    setFormError(null);
    setSuccessMessage(null);
    if (formHasInvalidNumbers(values, includePace)) {
      hapticError();
      setFormError('Enter valid numbers for each threshold you want to update.');
      return;
    }
    const body = toSportThresholdPatch(values, includePace);
    if (!body) {
      hapticError();
      setFormError('Enter valid numbers for each threshold you want to update.');
      return;
    }
    try {
      await saveMutation.mutateAsync({ profile, patch: body });
      hapticSuccess();
      setSuccessMessage('Thresholds saved.');
    } catch (err) {
      hapticError();
      setFormError(friendlyError(err, 'Failed to save sport profile'));
    }
  };

  const title = profile ? displaySportName(profile) : 'Sport profile';

  return (
    <>
      <Stack.Screen options={{ title, headerShown: true }} />
      {isLoading && !profiles ? (
        <View className="flex-1 items-center justify-center bg-surface">
          <ActivityIndicator color={Colors.brand} size="large" />
        </View>
      ) : isError && !profiles ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load sport profiles')}
          </Text>
          <Pressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="font-semibold text-brand">Retry</Text>
          </Pressable>
        </View>
      ) : !profile ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-base text-text-muted">This sport profile is no longer available.</Text>
          <Pressable
            className="mt-4"
            hitSlop={8}
            onPress={() => router.replace('/(app)/(tabs)/more/settings/sports' as Href)}
          >
            <Text className="font-semibold text-brand">Back to Sports</Text>
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
            <Text className="text-2xl font-semibold text-text-primary">{title}</Text>
            <Text className="mt-2 text-sm text-text-muted">
              Edit thresholds for this sport.
            </Text>

            <Field
              label="FTP (W)"
              value={values.ftp}
              onChangeText={(text) => patch('ftp', text)}
              keyboardType="number-pad"
              editable={!saveMutation.isPending}
            />
            <Field
              label="LTHR (bpm)"
              value={values.lthr}
              onChangeText={(text) => patch('lthr', text)}
              keyboardType="number-pad"
              editable={!saveMutation.isPending}
            />
            <Field
              label="Max HR (bpm)"
              value={values.maxHr}
              onChangeText={(text) => patch('maxHr', text)}
              keyboardType="number-pad"
              editable={!saveMutation.isPending}
            />
            {includePace ? (
              <Field
                label="Threshold pace"
                value={values.thresholdPace}
                onChangeText={(text) => patch('thresholdPace', text)}
                keyboardType="decimal-pad"
                editable={!saveMutation.isPending}
                placeholder="e.g. 5:15"
                helperText="Format: mm:ss per km, mile, or 100m (e.g. 5:15 or 1:45)"
              />
            ) : null}

            {formError ? <Text className="mt-4 text-sm text-red-400">{formError}</Text> : null}
            {successMessage ? (
              <Text className="mt-4 text-sm text-emerald-400">{successMessage}</Text>
            ) : null}

            <Button
              className="mt-6"
              label="Save thresholds"
              onPress={() => void onSave()}
              loading={saveMutation.isPending}
            />

            <Pressable
              className="mt-3 items-center rounded-xl border border-border-strong py-3.5 active:opacity-80"
              onPress={() => void openWeb()}
            >
              <Text className="text-base font-semibold text-text-primary">Open Sport Settings</Text>
            </Pressable>

            <Pressable
              className="mt-3 items-center rounded-xl border border-border-strong py-3.5 active:opacity-80"
              onPress={() => router.back()}
            >
              <Text className="text-base font-semibold text-text-primary">Cancel</Text>
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
  editable,
  placeholder,
  helperText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType: 'decimal-pad' | 'number-pad';
  editable: boolean;
  placeholder?: string;
  helperText?: string;
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
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
      />
      {helperText ? (
        <Text className="mt-1 text-xs text-text-muted">{helperText}</Text>
      ) : null}
    </View>
  );
}
