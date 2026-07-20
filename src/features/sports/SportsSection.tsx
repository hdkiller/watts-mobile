import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

import {
  displaySportName,
  sportSettingsWebPath,
  sportTypesSubtitle,
  thresholdSummary,
} from './mapSports';
import { useSportProfilesQuery } from './useSports';

function Chevron() {
  const theme = useThemeColors();
  if (Platform.OS === 'ios') {
    return <SymbolView name="chevron.right" size={14} tintColor={theme.textMuted} />;
  }
  return <Text className="text-base text-text-muted">›</Text>;
}

export function SportsSection() {
  const theme = useThemeColors();

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
        <View className="rounded-xl border border-danger/40 bg-tint-error p-3">
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
      <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
        Sport profiles
      </Text>

      {profiles.length === 0 ? (
        <Text className="mt-4 text-sm text-text-muted">
          No sport profiles yet. Create them in web Profile Settings → Sports.
        </Text>
      ) : (
        <View className="mt-3 gap-2">
          {profiles.map((profile) => {
            const subtitle = sportTypesSubtitle(profile);
            return (
              <Pressable
                key={profile.id}
                accessibilityRole="button"
                accessibilityLabel={displaySportName(profile)}
                className="rounded-xl border border-border bg-card/80 px-4 py-3 active:opacity-80"
                onPress={() =>
                  router.push(`/(app)/(tabs)/more/sports/${encodeURIComponent(profile.id)}` as Href)
                }
              >
                <View className="flex-row items-center gap-2">
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center justify-between gap-2">
                      <Text className="flex-1 text-base font-semibold text-text-primary" numberOfLines={1}>
                        {displaySportName(profile)}
                      </Text>
                      {profile.isDefault ? (
                        <Text className="text-[10px] font-semibold uppercase tracking-wide text-brand">
                          Default
                        </Text>
                      ) : null}
                    </View>
                    {subtitle ? (
                      <Text className="mt-1 text-xs text-text-muted" numberOfLines={1}>
                        {subtitle}
                      </Text>
                    ) : null}
                    <Text className="mt-1.5 text-sm text-text-body">
                      {thresholdSummary(profile)}
                    </Text>
                  </View>
                  <Chevron />
                </View>
              </Pressable>
            );
          })}
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
