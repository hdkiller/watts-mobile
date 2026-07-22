import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { AppSymbol } from '@/src/components/AppSymbol';
import {
  emptyQuickLogForm,
  quickLogHasContent,
  toNutritionUploadPayload,
} from '@/src/features/nutrition/mapNutrition';
import { MEAL_OPTIONS, type MealSlot, type NutritionQuickLogForm } from '@/src/features/nutrition/types';
import { useLogNutritionItem } from '@/src/features/nutrition/useNutrition';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

const MEAL_ICONS: Record<MealSlot, { label: string; icon: string }> = {
  BREAKFAST: { label: 'Breakfast', icon: '🥣' },
  LUNCH: { label: 'Lunch', icon: '🥗' },
  DINNER: { label: 'Dinner', icon: '🍽️' },
  SNACK: { label: 'Snack', icon: '🍎' },
  OTHER: { label: 'Other', icon: '🍴' },
};

interface LogMealSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function LogMealSheet({ visible, onClose }: LogMealSheetProps) {
  const theme = useThemeColors();
  const router = useRouter();
  const logMutation = useLogNutritionItem();

  const [form, setForm] = useState<NutritionQuickLogForm>(emptyQuickLogForm());
  const [showMacros, setShowMacros] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof NutritionQuickLogForm) => (text: string) => {
    setError(null);
    setForm((prev) => ({ ...prev, [key]: text }));
  };

  const setMeal = (meal: MealSlot) => {
    hapticLight();
    setError(null);
    setForm((prev) => ({ ...prev, meal }));
  };

  const onSubmit = async () => {
    if (!quickLogHasContent(form)) {
      hapticError();
      setError('Enter a meal name or at least one macro value.');
      return;
    }
    setError(null);
    try {
      await logMutation.mutateAsync(toNutritionUploadPayload(form));
      hapticSuccess();
      setForm(emptyQuickLogForm());
      setShowMacros(false);
      onClose();
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not log meal'));
    }
  };

  const openCameraEstimate = () => {
    hapticLight();
    onClose();
    router.push({
      pathname: '/(app)/(tabs)/coach',
      params: { attach: 'camera' },
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="rounded-t-3xl bg-surface px-6 pt-4 pb-10" style={{ maxHeight: '85%' }}>
          {/* Header handle */}
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-strong" />

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-text-primary">Log Meal</Text>
            <Pressable hitSlop={8} onPress={onClose} className="p-1 active:opacity-70">
              <Text className="text-base font-semibold text-text-muted">Cancel</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Meal Slot Pills */}
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Meal Slot
            </Text>
            <View className="flex-row gap-2 mb-4">
              {MEAL_OPTIONS.map((option) => {
                const selected = form.meal === option.value;
                const meta = MEAL_ICONS[option.value];
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected }}
                    className={`flex-1 items-center justify-center rounded-xl border py-2.5 ${
                      selected ? 'border-brand bg-brand/10' : 'border-border bg-card'
                    }`}
                    onPress={() => setMeal(option.value)}
                  >
                    <Text className="text-lg">{meta.icon}</Text>
                    <Text
                      className={`mt-1 text-[11px] font-semibold ${
                        selected ? 'text-brand' : 'text-text-muted'
                      }`}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Meal Item Input */}
            <View className="mb-4">
              <Text className="mb-1 text-xs font-semibold text-text-muted">Item / Description</Text>
              <TextInput
                className="rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
                placeholderTextColor={theme.textMuted}
                placeholder="e.g. Greek yogurt with granola & honey"
                value={form.name}
                onChangeText={update('name')}
              />
            </View>

            {/* Camera Photo CTA */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Estimate from photo with Coach Watts AI"
              className="mb-4 flex-row items-center justify-between rounded-xl border border-border bg-card p-3.5 active:opacity-80"
              onPress={openCameraEstimate}
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-brand/15">
                  <AppSymbol sf="camera.fill" size={16} tintColor={theme.brand} fallback="📷" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-text-primary">Photo Estimate with AI</Text>
                  <Text className="text-xs text-text-muted">Snap a meal photo for automatic macros</Text>
                </View>
              </View>
              <AppSymbol sf="chevron.right" size={14} tintColor={theme.textMuted} fallback="›" />
            </Pressable>

            {/* Expandable Manual Macros */}
            <Pressable
              className="mb-3 self-start py-1"
              hitSlop={8}
              onPress={() => {
                hapticLight();
                setShowMacros((prev) => !prev);
              }}
            >
              <Text className="text-xs font-semibold text-brand">
                {showMacros ? '− Hide manual macros' : '+ Add manual calories & macros'}
              </Text>
            </Pressable>

            {showMacros ? (
              <View className="rounded-xl border border-border bg-card p-4 mb-4 gap-3">
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="mb-1 text-xs text-text-muted">Calories (kcal)</Text>
                    <TextInput
                      className="rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-base text-text-primary"
                      placeholderTextColor={theme.textMuted}
                      placeholder="kcal"
                      value={form.calories}
                      onChangeText={update('calories')}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-xs text-text-muted">Protein (g)</Text>
                    <TextInput
                      className="rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-base text-text-primary"
                      placeholderTextColor={theme.textMuted}
                      placeholder="g"
                      value={form.protein}
                      onChangeText={update('protein')}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="mb-1 text-xs text-text-muted">Carbs (g)</Text>
                    <TextInput
                      className="rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-base text-text-primary"
                      placeholderTextColor={theme.textMuted}
                      placeholder="g"
                      value={form.carbs}
                      onChangeText={update('carbs')}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-xs text-text-muted">Fat (g)</Text>
                    <TextInput
                      className="rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-base text-text-primary"
                      placeholderTextColor={theme.textMuted}
                      placeholder="g"
                      value={form.fat}
                      onChangeText={update('fat')}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>
            ) : null}

            {error ? <Text className="mb-3 text-xs text-red-400">{error}</Text> : null}

            <Button
              className="mt-2"
              label="Save Meal"
              onPress={() => void onSubmit()}
              loading={logMutation.isPending}
              disabled={!quickLogHasContent(form)}
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
