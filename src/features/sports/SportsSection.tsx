import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Colors } from '@/src/theme/colors';

import {
  displaySportName,
  sportSettingsWebPath,
  thresholdSummary } from './mapSports';
import { useSportProfilesQuery } from './useSports';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';

export function SportsSection() {
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error, refetch, isRefetching } = useSportProfilesQuery();

  const openWeb = async () => {
    await openInstanceWeb(instanceUrl, sportSettingsWebPath());
  };

  if (isLoading && !data) {
    return (
      <View className="mt-6 items-center py-8">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View className="mt-6">
        <View className="rounded-xl border border-red-900/50 bg-red-950/40 p-3">
          <Text className="text-sm text-red-300">
            {friendlyError(error, 'Could not load sport profiles')}
          </Text>
          <Pressable className="mt-2" hitSlop={8} onPress={() => void refetch()}>
            <Text className="font-semibold text-brand">Retry</Text>
          </Pressable>
        </View>
        <Pressable className="mt-4 py-1 active:opacity-70" hitSlop={8} onPress={() => void openWeb()}>
          <Text className="text-sm font-semibold text-brand">Open web Sport Settings</Text>
        </Pressable>
      </View>
    );
  }

  const profiles = data ?? [];

  return (
    <View className="mt-6">
      <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Sport profiles
      </Text>

      {profiles.length === 0 ? (
        <Text className="mt-4 text-sm text-ink-muted">
          No sport profiles yet. Create them in web Profile Settings → Sports.
        </Text>
      ) : (
        <View className="mt-3 gap-2">
          {profiles.map((profile) => (
            <Pressable
              key={profile.id}
              accessibilityRole="button"
              accessibilityLabel={displaySportName(profile)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 active:opacity-80"
              onPress={() =>
                router.push(`/(app)/sports/${encodeURIComponent(profile.id)}` as Href)
              }
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1 text-base font-semibold text-white" numberOfLines={1}>
                  {displaySportName(profile)}
                </Text>
                {profile.isDefault ? (
                  <Text className="text-[10px] font-semibold uppercase tracking-wide text-brand">
                    Default
                  </Text>
                ) : null}
              </View>
              {profile.types.length > 0 ? (
                <Text className="mt-1 text-xs text-ink-muted" numberOfLines={1}>
                  {profile.types.join(' · ')}
                </Text>
              ) : null}
              <Text className="mt-1.5 text-sm text-zinc-300">{thresholdSummary(profile)}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        className="mt-4 py-1 active:opacity-70"
        hitSlop={8}
        onPress={() => void openWeb()}
        disabled={isRefetching}
      >
        <Text className="text-sm font-semibold text-brand">Open web Sport Settings</Text>
      </Pressable>
    </View>
  );
}
