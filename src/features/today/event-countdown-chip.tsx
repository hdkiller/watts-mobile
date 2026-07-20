import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';
import { pickNextEvent } from '@/src/features/events/mapEvents';
import { useUpcomingEventsQuery } from '@/src/features/events/useEvents';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';

export function EventCountdownChip() {
  const { instanceUrl } = useAuth();
  const { data, isError } = useUpcomingEventsQuery();

  if (isError) return null;
  const next = pickNextEvent(data);
  if (!next) return null;

  const openWeb = async () => {
    await openInstanceWeb(instanceUrl, '/calendar');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${next.title}, ${next.countdownLabel}`}
      className="mt-4 self-start rounded-full border border-border-strong bg-card/80 px-3 py-1.5 active:opacity-80"
      hitSlop={8}
      onPress={() => void openWeb()}
    >
      <View className="flex-row items-center gap-2">
        <Text className="text-sm font-medium text-text-primary" numberOfLines={1}>
          {next.title}
        </Text>
        <Text className="text-sm text-text-muted">— {next.countdownLabel}</Text>
      </View>
    </Pressable>
  );
}
