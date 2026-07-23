import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import {
  estimatePhotoNutrition,
  type DetectedFoodItem,
  type PhotoEstimateContext,
  type PhotoNutritionEstimate,
} from '@/src/features/nutrition/api';
import { Button } from '@/src/components/Button';
import { AppSymbol } from '@/src/components/AppSymbol';
import {
  getMealHistory,
  saveMealToHistory,
  type UserMealHistoryItem,
} from '@/src/features/nutrition/mealHistoryStorage';
import {
  emptyQuickLogForm,
  formatMacroGrams,
  localDateYmd,
  quickLogHasContent,
  toNutritionUploadPayload,
} from '@/src/features/nutrition/mapNutrition';
import {
  confidenceLabel,
  loggedMealContributions,
  saveMealDateLabel,
  type EstimateConfidence,
  type LogMealSheetMode,
} from '@/src/features/nutrition/logMealSheetMode';
import { resolvePickerPhoto } from '@/src/features/nutrition/resolvePickerPhoto';
import { MEAL_OPTIONS, type MealSlot, type NutritionQuickLogForm } from '@/src/features/nutrition/types';
import { useLogNutritionItem, useTodayNutritionQuery } from '@/src/features/nutrition/useNutrition';
import { usePhotoMealSettings } from '@/src/features/nutrition/usePhotoMealSettings';
import { NutritionTargetsCard } from '@/src/features/nutrition/NutritionTargetsCard';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useThemeColors } from '@/src/theme/useThemeColors';

/** Delay past fullScreenModal + system picker presentation so the first open isn't cancelled. */
const AUTO_OPEN_PICKER_DELAY_MS = 450;

const MEAL_ICONS: Record<MealSlot, { label: string; icon: string }> = {
  BREAKFAST: { label: 'Breakfast', icon: '🥣' },
  LUNCH: { label: 'Lunch', icon: '🥗' },
  DINNER: { label: 'Dinner', icon: '🍽️' },
  SNACK: { label: 'Snack', icon: '🍎' },
  OTHER: { label: 'Other', icon: '🍴' },
};

function MacroRatioBar({ form }: { form: NutritionQuickLogForm }) {
  const carbs = parseFloat(form.carbs) || 0;
  const protein = parseFloat(form.protein) || 0;
  const fat = parseFloat(form.fat) || 0;

  const carbsCal = carbs * 4;
  const proteinCal = protein * 4;
  const fatCal = fat * 9;
  const total = carbsCal + proteinCal + fatCal;

  if (total <= 0) return null;

  const carbsPct = Math.round((carbsCal / total) * 100);
  const proteinPct = Math.round((proteinCal / total) * 100);
  const fatPct = Math.max(0, 100 - carbsPct - proteinPct);

  return (
    <View className="mb-4 rounded-xl border border-border bg-card p-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-semibold text-text-primary">Macro Distribution</Text>
        <Text className="text-[11px] text-text-muted">{Math.round(total)} kcal</Text>
      </View>

      <View className="h-2.5 w-full flex-row overflow-hidden rounded-full bg-border">
        {carbsPct > 0 ? (
          <View style={{ width: `${carbsPct}%` }} className="h-full bg-amber-500" />
        ) : null}
        {proteinPct > 0 ? (
          <View style={{ width: `${proteinPct}%` }} className="h-full bg-emerald-500" />
        ) : null}
        {fatPct > 0 ? (
          <View style={{ width: `${fatPct}%` }} className="h-full bg-rose-500" />
        ) : null}
      </View>

      <View className="mt-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-amber-500" />
          <Text className="text-[11px] text-text-muted">Carbs {carbsPct}%</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-emerald-500" />
          <Text className="text-[11px] text-text-muted">Protein {proteinPct}%</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-rose-500" />
          <Text className="text-[11px] text-text-muted">Fat {fatPct}%</Text>
        </View>
      </View>
    </View>
  );
}

function DetectedItemsChips({
  items,
  onRemoveItem,
}: {
  items: DetectedFoodItem[];
  onRemoveItem: (index: number) => void;
}) {
  if (!items || items.length === 0) return null;

  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Detected Components
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {items.map((item, index) => (
          <View
            key={`${item.name}-${index}`}
            className="flex-row items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5"
          >
            <Text className="text-xs font-medium text-text-primary">
              {item.name}
              {item.portion ? ` (${item.portion})` : ''}
            </Text>
            <Pressable
              hitSlop={8}
              onPress={() => onRemoveItem(index)}
              className="ml-0.5 rounded-full p-0.5 active:opacity-60"
            >
              <Text className="text-xs font-bold text-text-muted">×</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

interface LogMealSheetProps {
  visible: boolean;
  onClose: () => void;
  autoOpenPicker?: boolean;
  onOpenPhotoFlow?: () => void;
  presentation?: 'sheet' | 'screen';
}

type CapturedPhoto = {
  uri: string;
  base64: string;
  mimeType: string;
};

type LoggedMealSnapshot = {
  name: string;
  photoUri: string | null;
  coachInsight: string | null;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

const NUTRIENT_ICONS = {
  Energy: { sf: 'flame.fill', md: 'local_fire_department', fallback: 'E' },
  Protein: { sf: 'dumbbell.fill', md: 'fitness_center', fallback: 'P' },
  Carbs: { sf: 'leaf.fill', md: 'grain', fallback: 'C' },
  Fat: { sf: 'drop.halffull', md: 'opacity', fallback: 'F' },
} as const;

const ANALYZING_MESSAGES = [
  'Scanning photo for food items…',
  'Estimating portion sizes & macros…',
  'Formulating Coach Insight…',
] as const;

function MacroFields({
  form,
  themeMuted,
  update,
}: {
  form: NutritionQuickLogForm;
  themeMuted: string;
  update: (key: keyof NutritionQuickLogForm) => (text: string) => void;
}) {
  return (
    <View className="rounded-xl border border-border bg-card p-4 mb-4 gap-3">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Text className="mb-1 text-xs text-text-muted">Calories (kcal)</Text>
          <TextInput
            className="rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-base text-text-primary"
            placeholderTextColor={themeMuted}
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
            placeholderTextColor={themeMuted}
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
            placeholderTextColor={themeMuted}
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
            placeholderTextColor={themeMuted}
            placeholder="g"
            value={form.fat}
            onChangeText={update('fat')}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
    </View>
  );
}

function MealSlotPicker({
  value,
  onSelect,
}: {
  value: MealSlot;
  onSelect: (meal: MealSlot) => void;
}) {
  return (
    <View className="flex-row gap-2 mb-4">
      {MEAL_OPTIONS.map((option) => {
        const selected = value === option.value;
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
            onPress={() => onSelect(option.value)}
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
  );
}

function SuccessContributionTile({
  label,
  value,
  order,
  reduceMotion,
}: {
  label: string;
  value: string;
  order: number;
  reduceMotion: boolean;
}) {
  const theme = useThemeColors();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 12);
  const icon = NUTRIENT_ICONS[label as keyof typeof NUTRIENT_ICONS] ?? NUTRIENT_ICONS.Energy;
  const tintColor =
    label === 'Energy'
      ? theme.modify
      : label === 'Protein'
        ? theme.recovery
        : label === 'Carbs'
          ? theme.brand
          : theme.zones[5];

  useEffect(() => {
    const delay = reduceMotion ? 0 : 220 + order * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: reduceMotion ? 100 : 280 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: reduceMotion ? 100 : 280 }));
  }, [opacity, order, reduceMotion, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      className="w-[48%] flex-row items-center gap-2.5 rounded-lg bg-surface px-3 py-2.5"
      style={style}
    >
      <View className="h-8 w-8 items-center justify-center rounded-full bg-border">
        <AppSymbol
          sf={icon.sf}
          md={icon.md}
          size={16}
          tintColor={tintColor}
          fallback={icon.fallback}
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-xs text-text-muted" numberOfLines={1}>
          {label}
        </Text>
        <Text className="mt-0.5 text-base font-semibold text-text-primary" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </Animated.View>
  );
}

function LoggedMealSuccess({
  meal,
  day,
  selectedDateYmd,
  isRefreshing,
  onDone,
  onLogAnother,
}: {
  meal: LoggedMealSnapshot;
  day: ReturnType<typeof useTodayNutritionQuery>['data'];
  selectedDateYmd: string;
  isRefreshing: boolean;
  onDone: () => void;
  onLogAnother: () => void;
}) {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const markOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const markScale = useSharedValue(reduceMotion ? 1 : 0.72);
  const headingOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const headingTranslateY = useSharedValue(reduceMotion ? 0 : 10);

  useEffect(() => {
    const duration = reduceMotion ? 100 : 380;
    markOpacity.value = withTiming(1, { duration });
    markScale.value = withTiming(1, { duration });
    headingOpacity.value = withDelay(
      reduceMotion ? 0 : 120,
      withTiming(1, { duration: reduceMotion ? 100 : 300 })
    );
    headingTranslateY.value = withDelay(
      reduceMotion ? 0 : 120,
      withTiming(0, { duration: reduceMotion ? 100 : 300 })
    );
  }, [headingOpacity, headingTranslateY, markOpacity, markScale, reduceMotion]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const headingStyle = useAnimatedStyle(() => ({
    opacity: headingOpacity.value,
    transform: [{ translateY: headingTranslateY.value }],
  }));

  const nutrients = loggedMealContributions(meal);

  return (
    <View className="pb-2">
      <View className="items-center pb-6 pt-4">
        <Animated.View
          accessibilityRole="image"
          accessibilityLabel="Meal logged successfully"
          className="h-20 w-20 items-center justify-center rounded-full border-4 border-brand/20 bg-brand"
          style={markStyle}
        >
          <AppSymbol sf="checkmark" md="check" size={34} tintColor={theme.ink} fallback="✓" />
        </Animated.View>
        <Animated.View className="items-center" style={headingStyle}>
          <Text className="mt-3 text-center text-sm text-text-muted">
            {meal.name || 'Your meal'} is now part of{' '}
            {saveMealDateLabel(selectedDateYmd).toLowerCase()}.
          </Text>
        </Animated.View>
      </View>

      {meal.photoUri ? (
        <Image
          source={{ uri: meal.photoUri }}
          className="mb-4 h-40 w-full rounded-2xl"
          resizeMode="cover"
          accessibilityLabel={`Logged meal photo for ${meal.name || 'meal'}`}
        />
      ) : null}

      {nutrients.length > 0 ? (
        <View className="mb-4 rounded-xl border border-border bg-card p-4">
          <Text className="text-sm font-semibold text-text-primary">Added to your day</Text>
          <View className="mt-3 flex-row flex-wrap justify-between gap-y-2">
            {nutrients.map((item, index) => (
              <SuccessContributionTile
                key={item.label}
                label={item.label}
                value={item.value}
                order={index}
                reduceMotion={reduceMotion}
              />
            ))}
          </View>
        </View>
      ) : null}

      {meal.coachInsight ? (
        <View className="mb-4 rounded-xl border border-brand/40 bg-tint-success px-4 py-3.5">
          <View className="flex-row items-center gap-2">
            <AppSymbol sf="bolt.fill" size={16} tintColor={theme.brand} fallback="⚡️" />
            <Text className="text-sm font-semibold text-brand">Coach Insight</Text>
          </View>
          <Text className="mt-2 text-sm leading-5 text-text-body">{meal.coachInsight}</Text>
        </View>
      ) : null}

      <View className="mb-5">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-text-primary">Your updated day</Text>
          {isRefreshing ? <Text className="text-xs text-text-muted">Updating…</Text> : null}
        </View>
        <NutritionTargetsCard
          day={day}
          isLoading={isRefreshing && !day}
          showHydration
          selectedDate={selectedDateYmd}
          showDateHeader
        />
      </View>

      <Button label="Done" onPress={onDone} haptic={false} />
      <Button
        label="Log another meal"
        variant="secondary"
        className="mt-2.5"
        onPress={onLogAnother}
      />
    </View>
  );
}

export function LogMealSheet({
  visible,
  onClose,
  autoOpenPicker,
  onOpenPhotoFlow,
  presentation = 'sheet',
}: LogMealSheetProps) {
  const theme = useThemeColors();
  const logMutation = useLogNutritionItem();
  const { sourceMode, saveToLibrary } = usePhotoMealSettings();

  const [mode, setMode] = useState<LogMealSheetMode>('compose');
  const [selectedDateYmd, setSelectedDateYmd] = useState(localDateYmd());
  const [form, setForm] = useState<NutritionQuickLogForm>(emptyQuickLogForm());
  const [historyItems, setHistoryItems] = useState<UserMealHistoryItem[]>([]);
  const [showMacros, setShowMacros] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [estimateConfidence, setEstimateConfidence] = useState<EstimateConfidence | undefined>();
  const [estimateInsight, setEstimateInsight] = useState<string | undefined>();
  const [estimateItems, setEstimateItems] = useState<DetectedFoodItem[]>([]);
  const [loggedMeal, setLoggedMeal] = useState<LoggedMealSnapshot | null>(null);

  const [analyzingStep, setAnalyzingStep] = useState(0);

  const nutritionQuery = useTodayNutritionQuery(selectedDateYmd, {
    enabled: visible,
  });
  const { data: dayNutrition, isLoading: isNutritionLoading, isFetching } = nutritionQuery;

  useEffect(() => {
    if (mode !== 'analyzing') return;
    const interval = setInterval(() => {
      setAnalyzingStep((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [mode]);

  const resetSheetState = () => {
    setMode('compose');
    setSelectedDateYmd(localDateYmd());
    setForm(emptyQuickLogForm());
    setShowMacros(false);
    setError(null);
    setCapturedPhoto(null);
    setEstimateConfidence(undefined);
    setEstimateInsight(undefined);
    setEstimateItems([]);
    setLoggedMeal(null);
    setAnalyzingStep(0);
  };

  const handleClose = () => {
    resetSheetState();
    onClose();
  };

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
      calories: item.calories > 0 ? String(Math.round(item.calories)) : '',
      protein: item.protein > 0 ? formatMacroGrams(item.protein) : '',
      carbs: item.carbs > 0 ? formatMacroGrams(item.carbs) : '',
      fat: item.fat > 0 ? formatMacroGrams(item.fat) : '',
    }));
  };

  const applyEstimate = (estimate: PhotoNutritionEstimate) => {
    setForm((prev) => ({
      ...prev,
      name: estimate.name,
      calories: estimate.calories > 0 ? String(Math.round(estimate.calories)) : '',
      protein: formatMacroGrams(estimate.protein),
      carbs: formatMacroGrams(estimate.carbs),
      fat: formatMacroGrams(estimate.fat),
      meal: estimate.meal ?? prev.meal,
    }));
    setEstimateConfidence(estimate.confidence);
    setEstimateInsight(estimate.coachInsight);
    setEstimateItems(estimate.items ?? []);
    setMode('review');
  };

  const clearEstimate = () => {
    setCapturedPhoto(null);
    setEstimateConfidence(undefined);
    setEstimateInsight(undefined);
    setEstimateItems([]);
    setForm(emptyQuickLogForm());
    setShowMacros(false);
    setError(null);
    setMode('compose');
  };

  const enterLogged = async (mealName: string) => {
    setLoggedMeal({
      name: mealName.trim(),
      photoUri: capturedPhoto?.uri ?? null,
      coachInsight: estimateInsight?.trim() || null,
      calories: form.calories,
      protein: form.protein,
      carbs: form.carbs,
      fat: form.fat,
    });
    setMode('logged');
    setCapturedPhoto(null);
    setEstimateConfidence(undefined);
    setEstimateInsight(undefined);
    setEstimateItems([]);
    setShowMacros(false);
    setForm(emptyQuickLogForm());
    hapticSuccess();
    try {
      await nutritionQuery.refetch();
    } catch {
      // Totals may still refresh via invalidation; keep confirmation visible.
    }
  };

  const handleRemoveDetectedItem = (index: number) => {
    hapticLight();
    setEstimateItems((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    if (!quickLogHasContent(form)) {
      hapticError();
      setError('Enter a meal name or select a history item.');
      return;
    }
    setError(null);
    const mealName = form.name;
    try {
      const payload = toNutritionUploadPayload(form);
      payload.date = selectedDateYmd;
      await logMutation.mutateAsync(payload);

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

      await enterLogged(mealName);
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not log meal'));
    }
  };

  const analyzeCapturedPhoto = async (photo: CapturedPhoto) => {
    setError(null);
    setAnalyzingStep(0);
    setMode('analyzing');
    setCapturedPhoto(photo);
    try {
      const context: PhotoEstimateContext = {
        selectedDate: selectedDateYmd,
        targetCalories: dayNutrition?.caloriesGoal ?? undefined,
        targetProtein: dayNutrition?.proteinGoal ?? undefined,
        targetCarbs: dayNutrition?.carbsGoal ?? undefined,
        targetFat: dayNutrition?.fatGoal ?? undefined,
      };
      const estimate = await estimatePhotoNutrition(photo.base64, photo.mimeType, context);
      applyEstimate(estimate);
      hapticSuccess();
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not analyze meal photo'));
      setMode('compose');
      setCapturedPhoto(null);
      setEstimateConfidence(undefined);
      setEstimateInsight(undefined);
      setEstimateItems([]);
    }
  };

  const handlePickerDismissedWithoutPhoto = () => {
    if (mode === 'review') return;
    setMode('compose');
  };

  const beginAnalyzeFromPickerAsset = async (
    asset: { uri?: string | null; base64?: string | null; mimeType?: string | null },
    options?: { saveCapturedToLibrary?: boolean }
  ) => {
    const photo = await resolvePickerPhoto(asset);
    if (!photo) {
      hapticError();
      setError('Could not read the selected photo. Try again or pick a different image.');
      handlePickerDismissedWithoutPhoto();
      return;
    }

    if (options?.saveCapturedToLibrary && photo.uri) {
      try {
        // @ts-ignore -- optional native dependency
        const MediaLibrary = require('expo-media-library');
        if (MediaLibrary?.requestPermissionsAsync && MediaLibrary?.saveToLibraryAsync) {
          const perm = await MediaLibrary.requestPermissionsAsync();
          if (perm.granted) {
            await MediaLibrary.saveToLibraryAsync(photo.uri);
          }
        }
      } catch {
        // Silently ignore if MediaLibrary module is missing or permission fails
      }
    }

    await analyzeCapturedPhoto(photo);
  };

  const handleTakePhoto = async () => {
    hapticLight();
    setError(null);
    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError('Camera permission is required to analyze meal photos.');
        setMode('compose');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]) {
        handlePickerDismissedWithoutPhoto();
        return;
      }

      await beginAnalyzeFromPickerAsset(result.assets[0], { saveCapturedToLibrary: saveToLibrary });
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not analyze meal photo'));
      setMode('compose');
      setCapturedPhoto(null);
    }
  };

  const handlePickPhoto = async () => {
    hapticLight();
    setError(null);
    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Photo library permission is required to select meal photos.');
        setMode('compose');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]) {
        handlePickerDismissedWithoutPhoto();
        return;
      }

      await beginAnalyzeFromPickerAsset(result.assets[0]);
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not analyze meal photo'));
      setMode('compose');
      setCapturedPhoto(null);
    }
  };

  const launchPhotoSourceAfterAlert = (launch: () => void) => {
    // Alert dismissal + system picker back-to-back often no-ops on the first try.
    InteractionManager.runAfterInteractions(() => {
      setTimeout(launch, 100);
    });
  };

  const handleChoosePhotoSource = () => {
    hapticLight();
    if (sourceMode === 'camera') {
      void handleTakePhoto();
    } else if (sourceMode === 'library') {
      void handlePickPhoto();
    } else {
      Alert.alert('Photo Estimate with AI', 'Choose photo source to analyze your meal:', [
        {
          text: 'Take Photo',
          onPress: () => launchPhotoSourceAfterAlert(() => void handleTakePhoto()),
        },
        {
          text: 'Choose from Library',
          onPress: () => launchPhotoSourceAfterAlert(() => void handlePickPhoto()),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    let openTimeout: ReturnType<typeof setTimeout> | undefined;

    const interaction = InteractionManager.runAfterInteractions(() => {
      openTimeout = setTimeout(
        () => {
          if (cancelled) return;
          resetSheetState();
          void loadHistory();
          if (autoOpenPicker) handleChoosePhotoSource();
        },
        autoOpenPicker ? AUTO_OPEN_PICKER_DELAY_MS : 0
      );
    });

    return () => {
      cancelled = true;
      interaction.cancel?.();
      if (openTimeout) clearTimeout(openTimeout);
    };
    // Reset and optionally start capture only on visibility/route-entry edges.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, autoOpenPicker]);

  const handleRetake = () => {
    hapticLight();
    setEstimateConfidence(undefined);
    handleChoosePhotoSource();
  };

  const handleLogAnother = () => {
    setMode('compose');
    setForm(emptyQuickLogForm());
    setShowMacros(false);
    setError(null);
    setCapturedPhoto(null);
    setEstimateConfidence(undefined);
    setEstimateInsight(undefined);
    setEstimateItems([]);
    setLoggedMeal(null);
  };

  const subtitle =
    mode === 'review'
      ? 'Review estimate, edit if needed, then save'
      : mode === 'logged'
        ? 'Your day has been updated'
        : mode === 'analyzing'
          ? 'Estimating meal from photo'
          : presentation === 'screen'
            ? 'Capture, review, then save'
            : 'Personal food history & quick logging';

  const confidenceCopy = confidenceLabel(estimateConfidence);
  const title =
    mode === 'logged'
      ? 'Meal logged'
      : presentation === 'screen'
        ? 'Photo Meal'
        : 'Log Meal';

  const content = (
    <>
      {presentation === 'sheet' ? (
        <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-strong" />
      ) : null}

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-bold text-text-primary">{title}</Text>
          <Text className="text-xs text-text-muted">{subtitle}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mode === 'logged' ? 'Done' : 'Cancel meal logging'}
          hitSlop={8}
          onPress={handleClose}
          className="p-1 active:opacity-70"
        >
          <Text
            className={`text-base font-semibold ${
              mode === 'logged' ? 'text-brand' : 'text-text-muted'
            }`}
          >
            {mode === 'logged' ? 'Done' : 'Cancel'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        key={mode}
        style={presentation === 'screen' ? { flex: 1 } : { flexShrink: 1 }}
        contentContainerStyle={{
          paddingBottom: presentation === 'screen' ? 32 : 8,
          // Keep compose/analyzing content laid out after camera/library modals dismiss.
          ...(presentation === 'screen' ? { flexGrow: 1 } : null),
        }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {mode === 'logged' && loggedMeal ? (
          <LoggedMealSuccess
            meal={loggedMeal}
            day={dayNutrition}
            selectedDateYmd={selectedDateYmd}
            isRefreshing={isFetching}
            onDone={handleClose}
            onLogAnother={handleLogAnother}
          />
        ) : null}

            {mode === 'analyzing' ? (
              <View className="mb-2 items-center rounded-xl border border-border bg-card p-5">
                {capturedPhoto?.uri ? (
                  <View className="relative mb-4 h-40 w-full overflow-hidden rounded-xl">
                    <Image
                      source={{ uri: capturedPhoto.uri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                      accessibilityLabel="Captured meal photo"
                    />
                    <View className="absolute inset-0 rounded-xl border-2 border-brand/40 bg-brand/10" />
                  </View>
                ) : null}
                <ActivityIndicator size="large" color={theme.brand} />
                <Text className="mt-3 text-base font-semibold text-text-primary">
                  {ANALYZING_MESSAGES[analyzingStep]}
                </Text>
                <Text className="mt-1 text-center text-xs text-text-muted">
                  Coach Watts AI is evaluating your meal photo
                </Text>
              </View>
            ) : null}

            {mode === 'review' ? (
              <View>
                {capturedPhoto?.uri ? (
                  <Image
                    source={{ uri: capturedPhoto.uri }}
                    style={{ width: '100%', height: 144, borderRadius: 12, marginBottom: 16 }}
                    resizeMode="cover"
                    accessibilityLabel="Meal photo used for estimate"
                  />
                ) : null}

                {estimateInsight ? (
                  <View className="mb-3 rounded-xl border border-brand/40 bg-tint-success px-4 py-3.5">
                    <View className="flex-row items-center gap-2">
                      <AppSymbol sf="bolt.fill" size={16} tintColor={theme.brand} fallback="⚡️" />
                      <Text className="text-sm font-bold text-brand">Coach Insight</Text>
                    </View>
                    <Text className="mt-1.5 text-sm leading-5 text-text-body">
                      {estimateInsight}
                    </Text>
                  </View>
                ) : null}

                <DetectedItemsChips items={estimateItems} onRemoveItem={handleRemoveDetectedItem} />

                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Meal Slot
                </Text>
                <MealSlotPicker value={form.meal} onSelect={setMeal} />

                <View className="mb-4">
                  <Text className="mb-1 text-xs font-semibold text-text-muted">Item / Description</Text>
                  <TextInput
                    className={`rounded-xl border bg-card px-4 py-3 text-base text-text-primary ${
                      estimateConfidence === 'HIGH'
                        ? 'border-emerald-500'
                        : estimateConfidence === 'MEDIUM'
                          ? 'border-amber-500'
                          : estimateConfidence === 'LOW'
                            ? 'border-rose-500'
                            : 'border-brand/50'
                    }`}
                    placeholderTextColor={theme.textMuted}
                    placeholder="Meal name"
                    value={form.name}
                    onChangeText={update('name')}
                  />
                  {confidenceCopy ? (
                    <Text
                      className={`mt-1.5 text-xs font-medium ${
                        estimateConfidence === 'HIGH'
                          ? 'text-brand'
                          : estimateConfidence === 'MEDIUM'
                            ? 'text-amber-500'
                            : 'text-rose-500'
                      }`}
                    >
                      {confidenceCopy}
                    </Text>
                  ) : null}
                </View>

                <MacroRatioBar form={form} />

                <MacroFields form={form} themeMuted={theme.textMuted} update={update} />

                {error ? <Text className="mb-3 text-xs text-red-400">{error}</Text> : null}

                <Button
                  className="mt-1"
                  label={`Save Meal for ${saveMealDateLabel(selectedDateYmd)}`}
                  onPress={() => void onSubmit()}
                  loading={logMutation.isPending}
                  disabled={!quickLogHasContent(form)}
                />
                <Button
                  variant="secondary"
                  className="mt-2.5"
                  label="Retake or change photo"
                  onPress={handleRetake}
                  disabled={logMutation.isPending}
                />
                <Pressable
                  className="mt-3 self-center py-2 active:opacity-70"
                  onPress={clearEstimate}
                  disabled={logMutation.isPending}
                >
                  <Text className="text-xs font-semibold text-text-muted">Clear estimate</Text>
                </Pressable>
              </View>
            ) : null}

            {mode === 'compose' ? (
              presentation === 'screen' ? (
                <View className="flex-1 items-center justify-center px-2 py-12">
                  <View className="h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
                    <AppSymbol sf="camera.fill" size={26} tintColor={theme.brand} fallback="📷" />
                  </View>
                  <Text className="mt-5 text-xl font-semibold text-text-primary">Add a meal photo</Text>
                  <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-text-muted">
                    Coach will estimate the meal, then you can review every value before saving.
                  </Text>
                  {error ? <Text className="mt-4 text-center text-sm text-red-400">{error}</Text> : null}
                  <View className="mt-6 w-full">
                    <Button
                      label={
                        sourceMode === 'camera'
                          ? 'Take meal photo'
                          : sourceMode === 'library'
                            ? 'Choose meal photo'
                            : 'Choose photo source'
                      }
                      onPress={handleChoosePhotoSource}
                    />
                    <Button
                      label="Cancel"
                      variant="secondary"
                      className="mt-2.5"
                      onPress={handleClose}
                    />
                  </View>
                </View>
              ) : (
              <View>
                <View className="mb-4">
                  <NutritionTargetsCard
                    day={dayNutrition}
                    isLoading={isNutritionLoading}
                    showHydration={false}
                    selectedDate={selectedDateYmd}
                    showDateHeader={true}
                    onPrevDate={handlePrevDate}
                    onNextDate={handleNextDate}
                    canGoNext={canGoNext}
                  />
                </View>

                {historyItems.length > 0 ? (
                  <>
                    <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Your Recent Food History
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="mb-4 flex-row"
                    >
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
                              <Text className="text-[10px] font-bold text-brand">
                                {item.calories} kcal
                              </Text>
                            ) : null}
                            {item.count > 1 ? (
                              <View className="rounded bg-border-strong px-1.5 py-0.5">
                                <Text className="text-[9px] font-bold text-text-muted">
                                  {item.count}x
                                </Text>
                              </View>
                            ) : null}
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </>
                ) : null}

                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Meal Slot
                </Text>
                <MealSlotPicker value={form.meal} onSelect={setMeal} />

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

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Estimate from photo with Coach Watts AI"
                  className="mb-4 flex-row items-center justify-between rounded-xl border border-border bg-card p-3.5 active:opacity-80"
                  onPress={onOpenPhotoFlow ?? handleChoosePhotoSource}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-border-strong">
                      <AppSymbol sf="camera.fill" size={16} tintColor={theme.brand} fallback="📷" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary">
                        Photo Estimate with AI
                      </Text>
                      <Text className="text-xs text-text-muted">
                        Take photo or choose from library, then review
                      </Text>
                    </View>
                  </View>
                  <AppSymbol sf="chevron.right" size={14} tintColor={theme.textMuted} fallback="›" />
                </Pressable>

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
                  <MacroFields form={form} themeMuted={theme.textMuted} update={update} />
                ) : null}

                {error ? <Text className="mb-3 text-xs text-red-400">{error}</Text> : null}
              </View>
              )
            ) : null}
      </ScrollView>

      {mode === 'compose' && presentation === 'sheet' ? (
        <View className="pt-3 border-t border-border bg-surface">
          <Button
            label={`Save Meal for ${saveMealDateLabel(selectedDateYmd)}`}
            onPress={() => void onSubmit()}
            loading={logMutation.isPending}
            disabled={!quickLogHasContent(form)}
          />
        </View>
      ) : null}
    </>
  );

  if (presentation === 'screen') {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 bg-surface px-6 pt-3">{content}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end">
        <Pressable
          accessible={false}
          className="absolute inset-0 bg-black/60"
          onPress={handleClose}
        />
        <View
          testID="log-meal-sheet"
          className="rounded-t-3xl bg-surface px-6 pt-4 pb-10"
          style={{ maxHeight: '88%', minHeight: 0 }}
        >
          {content}
        </View>
      </View>
    </Modal>
  );
}
