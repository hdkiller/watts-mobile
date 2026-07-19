import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';
import { absoluteInstanceUrl } from '@/src/features/activity/mapActivity';
import { Colors } from '@/src/theme/colors';

import {
  emptyQuickLogForm,
  formatMacroGrams,
  localDateYmd,
  nutritionWebPath,
  quickLogHasContent,
  toNutritionUploadPayload,
} from './mapNutrition';
import {
  useLogNutritionItem,
  useQuickAddHydration,
  useTodayNutritionQuery,
} from './useNutrition';
import {
  HYDRATION_QUICK_ML,
  MEAL_OPTIONS,
  type MealSlot,
  type NutritionQuickLogForm,
} from './types';

function MacroField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View className="mt-3 flex-1">
      <Text className="mb-1.5 text-xs text-ink-muted">{label}</Text>
      <TextInput
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-base text-white"
        placeholderTextColor={Colors.textMuted}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
      />
    </View>
  );
}

export function NutritionSection() {
  const { instanceUrl } = useAuth();
  const {
    data: today,
    isLoading,
    isError,
    error,
    refetch,
  } = useTodayNutritionQuery();
  const logMutation = useLogNutritionItem();
  const hydrationMutation = useQuickAddHydration();

  const [form, setForm] = useState<NutritionQuickLogForm>(emptyQuickLogForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const [hydrationSaved, setHydrationSaved] = useState<string | null>(null);

  const update =
    (key: keyof NutritionQuickLogForm) =>
    (text: string) => {
      setSaved(false);
      setFormError(null);
      setForm((prev) => ({ ...prev, [key]: text }));
    };

  const setMeal = (meal: MealSlot) => {
    setSaved(false);
    setFormError(null);
    setForm((prev) => ({ ...prev, meal }));
  };

  const onLogItem = async () => {
    if (!quickLogHasContent(form)) {
      setFormError('Enter a name or at least one macro before saving.');
      return;
    }
    setFormError(null);
    try {
      await logMutation.mutateAsync(toNutritionUploadPayload(form));
      setForm(emptyQuickLogForm(form.meal));
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const onHydration = async (volumeMl: number) => {
    setHydrationError(null);
    setHydrationSaved(null);
    try {
      await hydrationMutation.mutateAsync({ date: localDateYmd(), volumeMl });
      setHydrationSaved(`Added ${volumeMl} ml`);
    } catch (err) {
      setHydrationError(err instanceof Error ? err.message : 'Hydration save failed');
    }
  };

  const openWeb = async () => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(absoluteInstanceUrl(instanceUrl, nutritionWebPath()));
  };

  return (
    <View className="mt-10">
      <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Nutrition
      </Text>
      <Text className="text-sm text-ink-muted">
        Today’s totals, quick meal log, and hydration. Planning and grocery stay on web.
      </Text>

      {isLoading && !today ? (
        <ActivityIndicator className="mt-4" color={Colors.brand} />
      ) : null}

      {isError ? (
        <View className="mt-3 rounded-xl border border-red-900/50 bg-red-950/40 p-3">
          <Text className="text-sm text-red-300">
            {error instanceof Error ? error.message : 'Could not load nutrition'}
          </Text>
          <Pressable className="mt-2" onPress={() => void refetch()}>
            <Text className="font-semibold text-brand">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!isError && today ? (
        <View className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
          {today.isEmpty ? (
            <Text className="text-sm text-ink-muted">No nutrition logged yet today — start below.</Text>
          ) : (
            <>
              <Text className="text-lg font-semibold text-white">
                {today.calories} kcal
              </Text>
              <Text className="mt-1 text-sm text-ink-muted">
                P {formatMacroGrams(today.protein)}g · C {formatMacroGrams(today.carbs)}g · F{' '}
                {formatMacroGrams(today.fat)}g
              </Text>
            </>
          )}
          <Text className="mt-2 text-sm text-white">
            Water {(today.waterMl / 1000).toFixed(1)} L
          </Text>
        </View>
      ) : null}

      <Text className="mb-2 mt-6 text-sm text-ink-muted">Meal</Text>
      <View className="flex-row flex-wrap">
        {MEAL_OPTIONS.map((option) => {
          const selected = form.meal === option.value;
          return (
            <Pressable
              key={option.value}
              className={`mb-2 mr-2 rounded-full border px-3 py-2 ${
                selected ? 'border-brand bg-brand/20' : 'border-zinc-700 bg-zinc-900'
              }`}
              onPress={() => setMeal(option.value)}
            >
              <Text className={`text-xs font-semibold ${selected ? 'text-brand' : 'text-white'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-2">
        <Text className="mb-1.5 text-xs text-ink-muted">Name (optional)</Text>
        <TextInput
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-base text-white"
          placeholderTextColor={Colors.textMuted}
          placeholder="e.g. Greek yogurt"
          value={form.name}
          onChangeText={update('name')}
        />
      </View>

      <View className="flex-row gap-2">
        <MacroField
          label="Calories"
          value={form.calories}
          onChangeText={update('calories')}
          placeholder="320"
        />
        <MacroField
          label="Protein (g)"
          value={form.protein}
          onChangeText={update('protein')}
          placeholder="25"
        />
      </View>
      <View className="flex-row gap-2">
        <MacroField
          label="Carbs (g)"
          value={form.carbs}
          onChangeText={update('carbs')}
          placeholder="30"
        />
        <MacroField
          label="Fat (g)"
          value={form.fat}
          onChangeText={update('fat')}
          placeholder="10"
        />
      </View>

      {formError ? <Text className="mt-3 text-sm text-red-400">{formError}</Text> : null}
      {saved ? (
        <Text className="mt-3 text-sm font-semibold text-green-400">Logged — totals refreshed.</Text>
      ) : null}

      <Pressable
        className="mt-4 items-center rounded-xl bg-brand-action py-3.5 active:opacity-80"
        onPress={() => void onLogItem()}
        disabled={logMutation.isPending || !quickLogHasContent(form)}
      >
        {logMutation.isPending ? (
          <ActivityIndicator color="#09090b" />
        ) : (
          <Text className="text-base font-semibold text-ink">Log meal</Text>
        )}
      </Pressable>

      <Text className="mb-2 mt-6 text-sm text-ink-muted">Hydration</Text>
      <View className="flex-row flex-wrap">
        {HYDRATION_QUICK_ML.map((ml) => (
          <Pressable
            key={ml}
            className="mb-2 mr-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 active:opacity-80"
            onPress={() => void onHydration(ml)}
            disabled={hydrationMutation.isPending}
          >
            <Text className="text-xs font-semibold text-white">+{ml} ml</Text>
          </Pressable>
        ))}
      </View>
      {hydrationMutation.isPending ? (
        <ActivityIndicator className="mt-1" color={Colors.brand} />
      ) : null}
      {hydrationError ? <Text className="mt-2 text-sm text-red-400">{hydrationError}</Text> : null}
      {hydrationSaved ? (
        <Text className="mt-2 text-sm font-semibold text-green-400">{hydrationSaved}</Text>
      ) : null}

      <Pressable
        className="mt-5 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
        onPress={() => void openWeb()}
      >
        <Text className="text-base font-semibold text-white">Open web for planning</Text>
      </Pressable>
    </View>
  );
}
