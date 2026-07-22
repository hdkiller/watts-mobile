import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AppSymbol } from '@/src/components/AppSymbol';
import { hapticLight } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

interface WeightInputProps {
  value: string;
  unitLabel: string;
  isAutoSynced?: boolean;
  onChangeText: (v: string) => void;
}

export function WeightInput({
  value,
  unitLabel,
  isAutoSynced = false,
  onChangeText,
}: WeightInputProps) {
  const theme = useThemeColors();
  const [editing, setEditing] = useState(!isAutoSynced && !value);

  return (
    <View className="mt-4 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-semibold text-text-primary">Body Weight</Text>
          <Text className="mt-0.5 text-xs text-text-muted">Weight ({unitLabel}, optional)</Text>
        </View>

        {value ? (
          <Pressable
            hitSlop={8}
            onPress={() => {
              hapticLight();
              setEditing((prev) => !prev);
            }}
          >
            <Text className="text-xs font-semibold text-brand">
              {editing ? 'Done' : 'Adjust'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Auto-filled status badge */}
      {value && !editing ? (
        <View className="mt-3 flex-row items-center justify-between rounded-xl bg-surface p-3">
          <View className="flex-row items-center gap-2">
            <AppSymbol sf="ruler" size={16} tintColor={theme.brand} fallback="⚖️" />
            <Text className="text-base font-bold text-text-primary">
              {value} <Text className="text-xs font-normal text-text-muted">{unitLabel}</Text>
            </Text>
          </View>
          {isAutoSynced ? (
            <View className="rounded bg-brand/15 px-2 py-0.5">
              <Text className="text-[10px] font-bold text-brand">Auto-Synced</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <TextInput
          className="mt-3 rounded-xl border border-border-strong bg-surface px-4 py-3 text-base font-semibold text-text-primary"
          placeholderTextColor={theme.textMuted}
          placeholder={`e.g. 75 ${unitLabel}`}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
        />
      )}
    </View>
  );
}
