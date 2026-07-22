import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { estimatePhotoNutrition } from '@/src/features/nutrition/api';
import { Button } from '@/src/components/Button';
import { AppSymbol } from '@/src/components/AppSymbol';
import {
  getMealHistory,
  saveMealToHistory,
  type UserMealHistoryItem,
} from '@/src/features/nutrition/mealHistoryStorage';
import {
  emptyQuickLogForm,
  localDateYmd,
  quickLogHasContent,
  toNutritionUploadPayload,
} from '@/src/features/nutrition/mapNutrition';
import { MEAL_OPTIONS, type MealSlot, type NutritionQuickLogForm } from '@/src/features/nutrition/types';
import { useLogNutritionItem, useTodayNutritionQuery } from '@/src/features/nutrition/useNutrition';
import { NutritionTargetsCard } from '@/src/features/nutrition/NutritionTargetsCard';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

const MEAL_ICONS: Record<MealSlot, { label: string; icon: string }> = {
  BREAKFAST: { label: 'Breakfast', icon: '🥣' },
  LUNCH: { label: 'Lunch', icon: '🥗' },
  DINNER: { label: 'Dinner', icon: '🍽️' },
  SNACK: { label: 'Snack', icon: '🍎' },
  OTHER: { label: 'Other', icon: '🍴' },
};

function getYesterdayYmd(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return localDateYmd(yesterday);
}

interface LogMealSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function LogMealSheet({ visible, onClose }: LogMealSheetProps) {
  const theme = useThemeColors();
  const router = useRouter();
  const logMutation = useLogNutritionItem();

  const [selectedDateYmd, setSelectedDateYmd] = useState(localDateYmd());
  const [form, setForm] = useState<NutritionQuickLogForm>(emptyQuickLogForm());
  const [historyItems, setHistoryItems] = useState<UserMealHistoryItem[]>([]);
  const [showMacros, setShowMacros] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);

  const { data: dayNutrition, isLoading: isNutritionLoading } = useTodayNutritionQuery(selectedDateYmd, {
    enabled: visible,
  });

  useEffect(() => {
    if (visible) {
      setSelectedDateYmd(localDateYmd());
      setForm(emptyQuickLogForm());
      setShowMacros(false);
      setError(null);
      setPhotoNotice(null);
      setPhotoAnalyzing(false);
      void loadHistory();
    }
  }, [visible]);

  const handlePrevDate = () => {
    const d = new Date(selectedDateYmd + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDateYmd(localDateYmd(d));
  };

  const handleNextDate = () => {
    if (selectedDateYmd >= localDateYmd()) return;
    const d = new Date(selectedDateYmd + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDateYmd(localDateYmd(d));
  };

  const canGoNext = selectedDateYmd < localDateYmd();

  const loadHistory = async () => {
    const items = await getMealHistory();
    setHistoryItems(items);
  };

  const update = (key: keyof NutritionQuickLogForm) => (text: string) => {
    setError(null);
    setForm((prev) => ({ ...prev, [key]: text }));
  };

  const setMeal = (meal: MealSlot) => {
    hapticLight();
    setError(null);
    setForm((prev) => ({ ...prev, meal }));
  };

  const handleSelectHistoryItem = (item: UserMealHistoryItem) => {
    hapticLight();
    setError(null);
    setShowMacros(true);
    setForm((prev) => ({
      ...prev,
      name: item.name,
      calories: item.calories > 0 ? String(item.calories) : '',
      protein: item.protein > 0 ? String(item.protein) : '',
      carbs: item.carbs > 0 ? String(item.carbs) : '',
      fat: item.fat > 0 ? String(item.fat) : '',
    }));
  };

  const onSubmit = async () => {
    if (!quickLogHasContent(form)) {
      hapticError();
      setError('Enter a meal name or select a history item.');
      return;
    }
    setError(null);
    try {
      const payload = toNutritionUploadPayload(form);
      payload.date = selectedDateYmd; // Apply chosen date (Today or Yesterday)
      await logMutation.mutateAsync(payload);
      
      // Save item into user's personal meal history
      const numCal = Number(form.calories);
      const numProt = Number(form.protein);
      const numCarbs = Number(form.carbs);
      const numFat = Number(form.fat);
      const updatedHistory = await saveMealToHistory({
        name: form.name,
        calories: Number.isFinite(numCal) && numCal > 0 ? numCal : undefined,
        protein: Number.isFinite(numProt) && numProt > 0 ? numProt : undefined,
        carbs: Number.isFinite(numCarbs) && numCarbs > 0 ? numCarbs : undefined,
        fat: Number.isFinite(numFat) && numFat > 0 ? numFat : undefined,
      });
      setHistoryItems(updatedHistory);

      hapticSuccess();
      setForm(emptyQuickLogForm());
      setShowMacros(false);
      onClose();
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not log meal'));
    }
  };

  const handleTakePhoto = async () => {
    hapticLight();
    setError(null);
    setPhotoNotice(null);
    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError('Camera permission is required to analyze meal photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]?.base64) return;

      const asset = result.assets[0];
      setPhotoAnalyzing(true);

      const estimate = await estimatePhotoNutrition(
        asset.base64 ?? '',
        asset.mimeType ?? 'image/jpeg'
      );

      setForm((prev) => ({
        ...prev,
        name: estimate.name,
        calories: String(estimate.calories),
        protein: String(estimate.protein),
        carbs: String(estimate.carbs),
        fat: String(estimate.fat),
        meal: estimate.meal ?? prev.meal,
      }));
      setShowMacros(true);
      setPhotoNotice(`✨ AI estimated: ${estimate.name} (${estimate.calories} kcal). Confirm or edit below!`);
      hapticSuccess();
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not analyze meal photo'));
    } finally {
      setPhotoAnalyzing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="rounded-t-3xl bg-surface px-6 pt-4 pb-10" style={{ maxHeight: '88%' }}>
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-strong" />

          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-xl font-bold text-text-primary">Log Meal</Text>
              <Text className="text-xs text-text-muted">Personal food history & quick logging</Text>
            </View>
            <Pressable hitSlop={8} onPress={onClose} className="p-1 active:opacity-70">
              <Text className="text-base font-semibold text-text-muted">Cancel</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Daily Target Progress Card with Swipeable Date Header */}
            <View className="mb-4">
              <NutritionTargetsCard
                day={dayNutrition}
                isLoading={isNutritionLoading}
                showHydration={true}
                selectedDate={selectedDateYmd}
                showDateHeader={true}
                onPrevDate={handlePrevDate}
                onNextDate={handleNextDate}
                canGoNext={canGoNext}
              />
            </View>

            {/* Real User Personal Food History Chips */}
            {historyItems.length > 0 ? (
              <>
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Your Recent Food History
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row">
                  <View className="flex-row gap-2">
                    {historyItems.map((item) => (
                      <Pressable
                        key={item.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Add ${item.name}`}
                        className="flex-row items-center gap-1.5 rounded-full border border-border-strong bg-card px-3.5 py-2 active:opacity-80"
                        onPress={() => handleSelectHistoryItem(item)}
                      >
                        <Text className="text-sm">{item.emoji ?? '🍽️'}</Text>
                        <Text className="text-xs font-semibold text-text-primary">{item.name}</Text>
                        {item.calories > 0 ? (
                          <Text className="text-[10px] font-bold text-brand">{item.calories} kcal</Text>
                        ) : null}
                        {item.count > 1 ? (
                          <View className="rounded bg-border-strong px-1.5 py-0.5">
                            <Text className="text-[9px] font-bold text-text-muted">{item.count}x</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </>
            ) : null}

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
                placeholder="e.g. Banana, Greek yogurt, or custom meal"
                value={form.name}
                onChangeText={update('name')}
              />
            </View>

            {/* Camera Photo CTA */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Estimate from photo with Coach Watts AI"
              disabled={photoAnalyzing}
              className="mb-4 flex-row items-center justify-between rounded-xl border border-border bg-card p-3.5 active:opacity-80"
              onPress={() => void handleTakePhoto()}
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-border-strong">
                  {photoAnalyzing ? (
                    <ActivityIndicator size="small" color={theme.brand} />
                  ) : (
                    <AppSymbol sf="camera.fill" size={16} tintColor={theme.brand} fallback="📷" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text-primary">
                    {photoAnalyzing ? 'Analyzing photo with AI...' : 'Photo Estimate with AI'}
                  </Text>
                  <Text className="text-xs text-text-muted">
                    {photoAnalyzing ? 'Extracting meal & macros' : 'Take photo for automatic pre-fill'}
                  </Text>
                </View>
              </View>
              {!photoAnalyzing ? (
                <AppSymbol sf="chevron.right" size={14} tintColor={theme.textMuted} fallback="›" />
              ) : null}
            </Pressable>

            {photoNotice ? (
              <View className="mb-4 rounded-xl border border-brand/40 bg-brand/10 p-3">
                <Text className="text-xs font-semibold text-brand">{photoNotice}</Text>
              </View>
            ) : null}

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
                {showMacros ? '− Hide macro values' : '+ Edit calories & macros'}
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
              label={`Save Meal for ${
                selectedDateYmd === localDateYmd()
                  ? 'Today'
                  : selectedDateYmd === getYesterdayYmd()
                  ? 'Yesterday'
                  : selectedDateYmd
              }`}
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
