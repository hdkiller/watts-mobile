/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md */
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/src/components/Button';
import type { FoodItemResult } from './api';
import type { NutritionQuickLogForm } from './types';
import { hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

export interface PortionCalculatorModalProps {
  visible: boolean;
  item: FoodItemResult | null;
  onClose: () => void;
  onApplyPortion: (formValues: Partial<NutritionQuickLogForm>) => void;
}

export function PortionCalculatorModal({
  visible,
  item,
  onClose,
  onApplyPortion,
}: PortionCalculatorModalProps) {
  const theme = useThemeColors();

  // Gram weight state defaulting to serving_size_g if available, otherwise 100
  const defaultGrams = item?.serving_size_g && item.serving_size_g > 0 ? item.serving_size_g : 100;
  const [gramsInput, setGramsInput] = useState<string>(String(defaultGrams));

  const grams = useMemo(() => {
    const parsed = parseFloat(gramsInput);
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }, [gramsInput]);

  const calculated = useMemo(() => {
    if (!item || grams <= 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    }
    const factor = grams / 100;
    const per100 = item.nutrients_per_100g;

    return {
      calories: Math.round(per100.calories_kcal * factor),
      protein: Math.round(per100.protein_g * factor * 10) / 10,
      carbs: Math.round(per100.carbs_g * factor * 10) / 10,
      fat: Math.round(per100.fat_g * factor * 10) / 10,
      fiber: per100.fiber_g ? Math.round(per100.fiber_g * factor * 10) / 10 : 0,
    };
  }, [item, grams]);

  if (!visible || !item) return null;

  const handlePresetGrams = (presetGrams: number) => {
    hapticLight();
    setGramsInput(String(presetGrams));
  };

  const handleApply = () => {
    hapticSuccess();
    const brandPrefix = item.brand ? `${item.brand.trim()} ` : '';
    const portionSuffix = grams > 0 ? ` (${grams}g)` : '';
    const name = `${brandPrefix}${item.name.trim()}${portionSuffix}`;

    onApplyPortion({
      name,
      calories: String(calculated.calories),
      protein: String(calculated.protein),
      carbs: String(calculated.carbs),
      fat: String(calculated.fat),
    });
    onClose();
  };

  const servingDesc = item.serving_description || (item.serving_size_g ? `${item.serving_size_g}g serving` : '100g serving');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* NativeWind registers KeyboardAvoidingView with remapProps, not cssInterop, so
          `className` never resolves into a real style here — keep layout as a plain style. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Pressable accessible={false} className="absolute inset-0 bg-black/60" onPress={onClose} />

        <View
          testID="portion-calculator-modal"
          className="rounded-t-3xl bg-surface px-6 pt-4 pb-10"
          style={{ maxHeight: '85%', minHeight: 0 }}
        >
          {/* Sheet Handle */}
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-strong" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-text-primary" numberOfLines={1}>
                {item.name}
              </Text>
              {item.brand ? (
                <Text className="text-xs font-semibold text-brand">{item.brand}</Text>
              ) : (
                <Text className="text-xs text-text-muted">{servingDesc}</Text>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close portion calculator"
              hitSlop={8}
              onPress={onClose}
              className="p-1 active:opacity-70"
            >
              <Text className="text-base font-semibold text-text-muted">Cancel</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" className="flex-shrink-1">
            {/* Gram Weight Input */}
            <View className="mb-4 rounded-xl border border-border bg-card p-4">
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Portion Size (Grams)
              </Text>
              <View className="flex-row items-center gap-3">
                <TextInput
                  className="flex-1 rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-xl font-bold text-text-primary"
                  keyboardType="numeric"
                  value={gramsInput}
                  onChangeText={setGramsInput}
                  placeholder="100"
                  placeholderTextColor={theme.textMuted}
                />
                <Text className="text-base font-semibold text-text-primary">g</Text>
              </View>

              {/* Quick Gram Presets */}
              <View className="mt-3 flex-row flex-wrap gap-2">
                {[50, 100, 150, 200, item.serving_size_g].map((preset) => {
                  if (!preset || preset <= 0) return null;
                  const isSelected = grams === preset;
                  return (
                    <Pressable
                      key={preset}
                      onPress={() => handlePresetGrams(preset)}
                      className={`rounded-full border px-3 py-1 ${
                        isSelected
                          ? 'border-brand bg-tint-success'
                          : 'border-border bg-surface'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-brand' : 'text-text-muted'
                        }`}
                      >
                        {preset === item.serving_size_g ? `1 Serving (${preset}g)` : `${preset}g`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Calculated Macro Summary Card */}
            <View className="mb-5 rounded-2xl border border-border bg-card p-4">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Nutritional Breakdown ({grams}g)
              </Text>

              <View className="flex-row items-baseline gap-1 mb-4">
                <Text className="text-3xl font-extrabold text-text-primary">
                  {calculated.calories}
                </Text>
                <Text className="text-sm font-semibold text-text-muted">kcal</Text>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 rounded-xl bg-surface p-3 border border-border">
                  <Text className="text-[11px] font-semibold text-macro-carbs uppercase">Carbs</Text>
                  <Text className="mt-1 text-lg font-bold text-text-primary">
                    {calculated.carbs}g
                  </Text>
                </View>
                <View className="flex-1 rounded-xl bg-surface p-3 border border-border">
                  <Text className="text-[11px] font-semibold text-macro-protein uppercase">Protein</Text>
                  <Text className="mt-1 text-lg font-bold text-text-primary">
                    {calculated.protein}g
                  </Text>
                </View>
                <View className="flex-1 rounded-xl bg-surface p-3 border border-border">
                  <Text className="text-[11px] font-semibold text-macro-fat uppercase">Fat</Text>
                  <Text className="mt-1 text-lg font-bold text-text-primary">
                    {calculated.fat}g
                  </Text>
                </View>
              </View>
            </View>

            <Button
              label="Add to Meal Log"
              onPress={handleApply}
              disabled={grams <= 0}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
