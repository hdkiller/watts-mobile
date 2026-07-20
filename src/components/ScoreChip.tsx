import { Text, View } from 'react-native';

/** Compact score with muted /10 scale for athlete-facing chips and analysis rows. */
export function ScoreChip({
  label,
  score,
}: {
  label: string;
  score: string | number;
}) {
  const numeric = typeof score === 'number' ? score : Number(score);
  const low = Number.isFinite(numeric) && numeric > 0 && numeric <= 3;

  return (
    <View className="rounded-full border border-border-strong bg-surface/60 px-2.5 py-1">
      <View className="flex-row items-baseline gap-0.5">
        <Text className={`text-[11px] font-semibold ${low ? 'text-amber-300' : 'text-text-body'}`}>
          {label} {score}
        </Text>
        <Text className="text-[10px] text-text-muted">/10</Text>
      </View>
    </View>
  );
}

/** Fixed-width score cell for analysis grids. */
export function ScoreCell({
  label,
  score,
}: {
  label: string;
  score: string | number;
}) {
  return (
    <View className="mb-2 w-1/3 pr-2">
      <Text className="text-xs text-text-muted">{label}</Text>
      <View className="mt-0.5 flex-row items-baseline">
        <Text className="text-lg font-semibold text-text-primary">{score}</Text>
        <Text className="ml-0.5 text-xs text-text-muted">/10</Text>
      </View>
    </View>
  );
}
