import { Text, View } from 'react-native';

type OfflineBannerProps = {
  /** True when showing stale cache because the network request failed. */
  visible: boolean;
  lastUpdatedLabel?: string | null;
};

export function OfflineBanner({ visible, lastUpdatedLabel }: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View className="mb-3 rounded-lg border border-amber-900/40 bg-amber-950/40 px-3 py-2">
      <Text className="text-sm text-amber-200">
        You’re offline — showing last saved data
        {lastUpdatedLabel ? ` · updated ${lastUpdatedLabel}` : ''}
      </Text>
    </View>
  );
}

export function formatLastUpdated(date: Date | number | null | undefined): string | null {
  if (date == null) return null;
  const d = typeof date === 'number' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
