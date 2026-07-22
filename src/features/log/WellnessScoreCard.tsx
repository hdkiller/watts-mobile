import { Pressable, Text, View } from 'react-native';

import { clampSubjectiveScore } from '@/src/features/log/wellnessLabels';
import { hapticLight } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

const SUBJECTIVE_DEFAULT = 5;

interface WellnessScoreCardProps {
  label: string;
  help: string;
  value: number | null;
  tintColor: string;
  onChange: (next: number) => void;
}

export function WellnessScoreCard({
  label,
  help,
  value,
  tintColor,
  onChange,
}: WellnessScoreCardProps) {
  const theme = useThemeColors();
  const isAnswered = value != null;
  const current = value ?? 5;

  const handleSelect = (score: number) => {
    hapticLight();
    onChange(clampSubjectiveScore(score));
  };

  return (
    <View className="mt-4 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-sm font-semibold text-text-primary">{label}</Text>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-lg font-bold" style={{ color: isAnswered ? tintColor : theme.textMuted }}>
            {isAnswered ? current : '—'}
          </Text>
          <Text className="text-xs text-text-muted">/ 10</Text>
        </View>
      </View>
      <Text className="mt-1 text-xs text-text-muted">{help}</Text>

      {/* 1 to 10 visual pill selector */}
      <View className="mt-3 flex-row gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
          const active = value === score;
          const isFilled = isAnswered && current >= score;

          return (
            <Pressable
              key={score}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${score}`}
              accessibilityState={{ selected: active }}
              className="h-9 flex-1 items-center justify-center rounded-lg active:opacity-80"
              style={{
                backgroundColor: active
                  ? tintColor
                  : isFilled
                  ? `${tintColor}22`
                  : theme.border,
                borderWidth: active ? 1.5 : 0,
                borderColor: active ? tintColor : 'transparent',
              }}
              onPress={() => handleSelect(score)}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: active
                    ? '#000000'
                    : isFilled
                    ? tintColor
                    : theme.textMuted,
                }}
              >
                {score}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
