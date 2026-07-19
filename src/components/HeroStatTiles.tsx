import { Text, View } from 'react-native';

export type HeroStat = {
  label: string;
  value: string;
};

/** Compact label+value tiles matching Today's recovery metric glance. */
export function HeroStatTiles({ stats }: { stats: HeroStat[] }) {
  if (stats.length === 0) return null;

  return (
    <View className="mt-4 flex-row gap-2">
      {stats.map((stat) => (
        <View
          key={stat.label}
          className="min-w-0 flex-1 rounded-lg border border-zinc-800 px-3 py-3"
        >
          <Text className="text-[10px] uppercase text-ink-muted">{stat.label}</Text>
          <Text className="mt-1 text-lg font-semibold text-white" numberOfLines={1}>
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
