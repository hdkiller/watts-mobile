import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import {
  aiPersonaOptions,
  profileSettingsWebPath } from '@/src/features/profile/mapProfile';
import {
  useAiSettingsAvailableQuery,
  useAiSettingsLiteQuery,
  useAthleteProfileQuery,
  usePatchCoachIdentity } from '@/src/features/profile/useProfile';
import type { AiPersona } from '@/src/features/profile/types';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';

export default function CoachIdentityScreen() {
  const { instanceUrl } = useAuth();
  const profileQuery = useAthleteProfileQuery();
  const availableQuery = useAiSettingsAvailableQuery();
  const aiAvailable = availableQuery.data === true;
  const aiQuery = useAiSettingsLiteQuery(aiAvailable);
  const saveMutation = usePatchCoachIdentity();

  const [nickname, setNickname] = useState('');
  const [aiContext, setAiContext] = useState('');
  const [persona, setPersona] = useState<AiPersona>('Supportive');
  const [requireToolApproval, setRequireToolApproval] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profileQuery.data) return;
    setNickname(profileQuery.data.nickname ?? '');
    setAiContext(profileQuery.data.aiContext ?? '');
  }, [profileQuery.data]);

  useEffect(() => {
    if (!aiQuery.data) return;
    setPersona(aiQuery.data.aiPersona);
    setRequireToolApproval(aiQuery.data.aiRequireToolApproval);
  }, [aiQuery.data]);

  const openWebAiSettings = async () => {
    await openInstanceWeb(instanceUrl, '/settings/ai');
  };

  const openWebProfile = async () => {
    await openInstanceWeb(instanceUrl, profileSettingsWebPath());
  };

  const onSave = async () => {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await saveMutation.mutateAsync({
        profile: {
          nickname: nickname.trim() || null,
          aiContext: aiContext.trim() || null },
        aiAvailable,
        ai: aiAvailable
          ? {
              aiPersona: persona,
              aiRequireToolApproval: requireToolApproval }
          : undefined });
      hapticSuccess();
      setSuccessMessage('Coach identity saved.');
    } catch (err) {
      hapticError();
      setFormError(friendlyError(err, 'Failed to save coach identity'));
    }
  };

  const loading =
    (profileQuery.isLoading && !profileQuery.data) ||
    availableQuery.isLoading ||
    (aiAvailable && aiQuery.isLoading && !aiQuery.data);

  const loadError =
    (profileQuery.isError && !profileQuery.data) ||
    (aiAvailable && aiQuery.isError && !aiQuery.data);

  const pending = saveMutation.isPending;

  return (
    <>
      <Stack.Screen options={{ title: 'Coach identity', headerShown: true }} />
      <SafeAreaView
        edges={{ bottom: true }}
        style={{ flex: 1, backgroundColor: Colors.background }}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center bg-surface-dark">
            <ActivityIndicator color={Colors.brand} size="large" />
            <Text className="mt-3 text-sm text-ink-muted">Loading coach prefs…</Text>
          </View>
        ) : loadError ? (
          <View className="flex-1 bg-surface-dark px-6 pt-6">
            <Text className="text-red-400">
              {friendlyError(
                profileQuery.error ?? aiQuery.error,
                'Failed to load coach identity'
              )}
            </Text>
            <Button
              className="mt-4"
              label="Try again"
              onPress={() => {
                void profileQuery.refetch();
                void availableQuery.refetch();
                if (aiAvailable) void aiQuery.refetch();
              }}
            />
          </View>
        ) : (
          <ScrollView
            className="flex-1 bg-surface-dark"
            contentContainerClassName="px-6 pb-12 pt-4"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-2xl font-semibold text-white">Coach identity</Text>
            <Text className="mt-1 text-sm text-ink-muted">
              How Coach Watts addresses you and behaves in chat. Automation and voice stay on the
              web.
            </Text>

            <View className="mt-6">
              <Text className="text-xs uppercase tracking-wide text-ink-muted">Nickname</Text>
              <TextInput
                className="mt-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-base text-white"
                value={nickname}
                onChangeText={setNickname}
                editable={!pending}
                placeholder="What should Coach call you?"
                placeholderTextColor={Colors.textMuted}
                maxLength={50}
              />
            </View>

            <View className="mt-5">
              <Text className="text-xs uppercase tracking-wide text-ink-muted">About me</Text>
              <TextInput
                className="mt-2 min-h-[120px] rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-base text-white"
                value={aiContext}
                onChangeText={setAiContext}
                editable={!pending}
                placeholder="Context Coach should remember (goals, constraints, preferences)"
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>

            {aiAvailable ? (
              <>
                <View className="mt-6">
                  <Text className="text-xs uppercase tracking-wide text-ink-muted">Persona</Text>
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {aiPersonaOptions().map((option) => {
                      const selected = option.value === persona;
                      return (
                        <Pressable
                          key={option.value}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          disabled={pending}
                          className={`rounded-lg px-3 py-2 ${
                            selected ? 'bg-brand' : 'border border-zinc-700 bg-zinc-900'
                          } ${pending ? 'opacity-50' : 'active:opacity-80'}`}
                          onPress={() => {
                            hapticLight();
                            setPersona(option.value);
                          }}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              selected ? 'text-zinc-950' : 'text-white'
                            }`}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View className="mt-6 flex-row items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
                  <View className="mr-4 flex-1">
                    <Text className="text-base font-semibold text-white">Require tool approval</Text>
                    <Text className="mt-1 text-sm text-ink-muted leading-5">
                      Ask before Coach runs tools that change your data.
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#27272a', true: Colors.brand }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#fafafa'}
                    value={requireToolApproval}
                    onValueChange={(val) => {
                      hapticLight();
                      setRequireToolApproval(val);
                    }}
                    disabled={pending}
                  />
                </View>
              </>
            ) : (
              <View className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
                <Text className="text-base font-semibold text-white">Persona & tool approval</Text>
                <Text className="mt-1 text-sm text-ink-muted leading-5">
                  These preferences need a server update before they can be edited in the app. Open
                  web AI Coach settings for now — nickname and About me still save here.
                </Text>
                <Pressable
                  className="mt-3 self-start active:opacity-80"
                  onPress={() => void openWebAiSettings()}
                >
                  <Text className="text-sm font-medium text-brand">Open web AI settings</Text>
                </Pressable>
              </View>
            )}

            {formError ? <Text className="mt-4 text-sm text-red-400">{formError}</Text> : null}
            {successMessage ? (
              <Text className="mt-4 text-sm text-emerald-400">{successMessage}</Text>
            ) : null}

            <Button
              className="mt-6"
              label="Save"
              loading={pending}
              onPress={() => void onSave()}
            />

            <Pressable
              className="mt-3 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
              onPress={() => void openWebProfile()}
            >
              <Text className="text-base font-semibold text-white">Open web Profile Settings</Text>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
