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
import {
  defaultPortionGrams,
  foodItemKey,
  parseGrams,
  portionPresets,
  scalePortion,
  servingDescription,
} from './portionMath';
import type { NutritionQuickLogForm } from './types';
import { hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

export interface PortionCalculatorModalProps {
  visible: boolean;
  item: FoodItemResult | null;
  onClose: () => void;
  /** Fires once the modal has finished dismissing. iOS only (RN Modal.onDismiss). */
  onDismissed?: () => void;
  onApplyPortion: (formValues: Partial<NutritionQuickLogForm>) => void;
}

export function PortionCalculatorModal({
  visible,
  item,
  onClose,
  onDismissed,
  onApplyPortion,
}: PortionCalculatorModalProps) {
  const theme = useThemeColors();

  // This modal stays mounted while `visible` toggles, so gram state has to be re-seeded
  // whenever the user picks a different food — otherwise the first item's weight (and the
  // initial 100 g default) sticks for every later item. Render-time sync, not an effect.
  const itemKey = foodItemKey(item);
  const [gramsInput, setGramsInput] = useState<string>(() => String(defaultPortionGrams(item)));
  const [prevItemKey, setPrevItemKey] = useState(itemKey);
  if (itemKey !== prevItemKey) {
    setPrevItemKey(itemKey);
    setGramsInput(String(defaultPortionGrams(item)));
  }

  const grams = useMemo(() => parseGrams(gramsInput), [gramsInput]);

  const calculated = useMemo(() => scalePortion(item?.nutrients_per_100g, grams), [item, grams]);

  if (!item) return null;

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

  const servingDesc = servingDescription(item);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onDismiss={onDismissed}
    >
      {/* NativeWind registers KeyboardAvoidingView with remapProps, not cssInterop, so
          `className` never resolves into a real style here — keep layout as a plain style. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Pressable accessible={false} className="absolute inset-0 bg-black/60" onPress={onClose} />

        <View
          testID="portion-calculator-modal"
          className="rounded-t-3xl bg-surface px-6 pb-10 pt-4"
          style={{ maxHeight: '85%', minHeight: 0 }}
        >
          {/* Sheet Handle */}
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-strong" />

          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
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
                {portionPresets(item).map((preset) => {
                  const isSelected = grams === preset;
                  return (
                    <Pressable
                      key={preset}
                      onPress={() => handlePresetGrams(preset)}
                      className={`rounded-full border px-3 py-1 ${
                        isSelected ? 'border-brand bg-tint-success' : 'border-border bg-surface'
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

              <View className="mb-4 flex-row items-baseline gap-1">
                <Text className="text-3xl font-extrabold text-text-primary">
                  {calculated.calories}
                </Text>
                <Text className="text-sm font-semibold text-text-muted">kcal</Text>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 rounded-xl border border-border bg-surface p-3">
                  <Text className="text-[11px] font-semibold uppercase text-macro-carbs">
                    Carbs
                  </Text>
                  <Text className="mt-1 text-lg font-bold text-text-primary">
                    {calculated.carbs}g
                  </Text>
                </View>
                <View className="flex-1 rounded-xl border border-border bg-surface p-3">
                  <Text className="text-[11px] font-semibold uppercase text-macro-protein">
                    Protein
                  </Text>
                  <Text className="mt-1 text-lg font-bold text-text-primary">
                    {calculated.protein}g
                  </Text>
                </View>
                <View className="flex-1 rounded-xl border border-border bg-surface p-3">
                  <Text className="text-[11px] font-semibold uppercase text-macro-fat">Fat</Text>
                  <Text className="mt-1 text-lg font-bold text-text-primary">
                    {calculated.fat}g
                  </Text>
                </View>
              </View>
            </View>

            <Button label="Add to Meal Log" onPress={handleApply} disabled={grams <= 0} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
