import { Pressable, Text, TextInput, View } from 'react-native';

import { hapticLight } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

const PRESET_HOURS = ['6', '6.5', '7', '7.5', '8', '8.5', '9'];

interface SleepDurationInputProps {
  value: string;
  onChangeText: (v: string) => void;
  onStep: (delta: number) => void;
}

export function SleepDurationInput({
  value,
  onChangeText,
  onStep,
}: SleepDurationInputProps) {
  const theme = useThemeColors();

  const handlePreset = (preset: string) => {
    hapticLight();
    onChangeText(preset);
  };

  const handleStep = (delta: number) => {
    hapticLight();
    onStep(delta);
  };

  return (
    <View className="mt-4 rounded-xl border border-border bg-card p-4">
      <Text className="text-sm font-semibold text-text-primary">Sleep Duration</Text>
      <Text className="mt-1 text-xs text-text-muted">Total hours slept last night</Text>

      {/* Quick preset duration pills */}
      <View className="mt-3 flex-row flex-wrap gap-2">
        {PRESET_HOURS.map((preset) => {
          const active = value.trim() === preset;
          return (
            <Pressable
              key={preset}
              accessibilityRole="button"
              accessibilityLabel={`${preset} hours`}
              accessibilityState={{ selected: active }}
              className="rounded-full px-3 py-1.5 active:opacity-80"
              style={{
                backgroundColor: active ? theme.borderStrong : theme.border,
                borderWidth: active ? 1.5 : 1,
                borderColor: active ? theme.textPrimary : 'transparent',
              }}
              onPress={() => handlePreset(preset)}
            >
              <Text
                className={`text-xs font-semibold ${
                  active ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {preset} hrs
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Stepper + Input */}
      <View className="mt-4 flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease sleep hours by 0.5"
          className="h-11 w-11 items-center justify-center rounded-xl border border-border-strong bg-surface active:opacity-80"
          onPress={() => handleStep(-0.5)}
        >
          <Text className="text-xl font-bold text-text-primary">−</Text>
        </Pressable>
        <TextInput
          className="h-11 flex-1 rounded-xl border border-border-strong bg-surface px-4 py-2 text-center text-base font-semibold text-text-primary"
          placeholderTextColor={theme.textMuted}
          placeholder="7.5"
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase sleep hours by 0.5"
          className="h-11 w-11 items-center justify-center rounded-xl border border-border-strong bg-surface active:opacity-80"
          onPress={() => handleStep(0.5)}
        >
          <Text className="text-xl font-bold text-text-primary">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
