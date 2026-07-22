import { Pressable, Text, View } from 'react-native';

import { AppSymbol } from '@/src/components/AppSymbol';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { optionById } from '@/src/features/recovery/taxonomy';
import { hapticLight } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

interface RecoveryEventCardProps {
  item: RecoveryContextItem;
  onPress: (item: RecoveryContextItem) => void;
}

export function RecoveryEventCard({ item, onPress }: RecoveryEventCardProps) {
  const theme = useThemeColors();
  const readOnly = item.sourceType === 'imported' || !item.editable;

  const option = optionById(item.label as any);
  const iconSf = option?.sf ?? 'waveform.path.ecg';
  const iconEmoji = option?.emoji ?? '🩹';

  const severity = item.severity ?? 5;
  const severityPct = (severity / 10) * 100;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.label}, severity ${severity} of 10${
        readOnly ? ', read-only' : ''
      }`}
      className="mb-3 rounded-xl border border-border bg-card p-4 active:opacity-80"
      onPress={() => {
        hapticLight();
        onPress(item);
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${Colors.modify}22` }}
          >
            <AppSymbol
              sf={iconSf as any}
              size={18}
              tintColor={Colors.modify}
              fallback={iconEmoji}
            />
          </View>

          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-text-primary">
                {item.label}
              </Text>
              {readOnly ? (
                <View className="rounded bg-border px-1.5 py-0.5">
                  <Text className="text-[10px] font-semibold text-text-muted">
                    Auto Sync
                  </Text>
                </View>
              ) : null}
            </View>
            <Text className="text-xs text-text-muted">
              Severity {severity}/10 · Active today
            </Text>
          </View>
        </View>

        <AppSymbol
          sf="chevron.right"
          size={14}
          tintColor={theme.textMuted}
          fallback="›"
        />
      </View>

      {/* Severity meter */}
      <View className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <View
          className="h-full rounded-full"
          style={{
            width: `${severityPct}%`,
            backgroundColor:
              severity > 7
                ? Colors.danger
                : severity > 4
                ? Colors.modify
                : Colors.brand,
          }}
        />
      </View>
    </Pressable>
  );
}
