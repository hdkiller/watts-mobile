import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { Colors } from '@/src/theme/colors';

import {
  emptyQuickLogForm,
  formatMacroGrams,
  localDateYmd,
  nutritionWebPath,
  quickLogHasContent,
  toNutritionUploadPayload } from './mapNutrition';
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
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';

function MacroField({
  label,
  value,
  onChangeText,
  placeholder }: {
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
  const router = useRouter();
  const { instanceUrl } = useAuth();
  const {
    data: today,
    isLoading,
    isError,
    error,
    refetch } = useTodayNutritionQuery();
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
      setFormError(friendlyError(err, 'Save failed'));
    }
  };

  const onHydration = async (volumeMl: number) => {
    setHydrationError(null);
    setHydrationSaved(null);
    try {
      await hydrationMutation.mutateAsync({ date: localDateYmd(), volumeMl });
      setHydrationSaved(`Added ${volumeMl} ml`);
    } catch (err) {
      setHydrationError(friendlyError(err, 'Hydration save failed'));
    }
  };

  const openWeb = async () => {
    await openInstanceWeb(instanceUrl, nutritionWebPath());
  };

  return (
    <View className="mt-4">
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
            {friendlyError(error, 'Could not load nutrition')}
          </Text>
          <Pressable className="mt-2" onPress={() => void refetch()}>
            <Text className="font-semibold text-brand">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!isError && today ? (
        <View className="mt-4">
          {today.isEmpty ? (
            <View className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
              <Text className="text-sm text-ink-muted">No nutrition logged yet today — start below.</Text>
            </View>
          ) : (
            <View className="gap-3">
              <View className="flex-row gap-3">
                {/* Calories Tile */}
                <View className="flex-1 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-3.5 shadow-sm">
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Calories</Text>
                  <Text className="text-2xl font-black text-white mt-2">{today.calories} <Text className="text-xs font-semibold text-zinc-500">kcal</Text></Text>
                </View>
                {/* Water Tile */}
                <View className="flex-1 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-3.5 shadow-sm">
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Water</Text>
                  <Text className="text-2xl font-black text-white mt-2">{(today.waterMl / 1000).toFixed(1)} <Text className="text-xs font-semibold text-zinc-500">L</Text></Text>
                </View>
              </View>
              {/* Macros Row */}
              <View className="flex-row gap-2.5">
                <View className="flex-1 bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-3 items-center shadow-sm">
                  <View className="h-1 w-8 rounded-full bg-orange-400/80 mb-2" />
                  <Text className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Protein</Text>
                  <Text className="text-base font-extrabold text-orange-400 mt-1">{formatMacroGrams(today.protein)}g</Text>
                </View>
                <View className="flex-1 bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-3 items-center shadow-sm">
                  <View className="h-1 w-8 rounded-full bg-brand/80 mb-2" />
                  <Text className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Carbs</Text>
                  <Text className="text-base font-extrabold text-brand mt-1">{formatMacroGrams(today.carbs)}g</Text>
                </View>
                <View className="flex-1 bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-3 items-center shadow-sm">
                  <View className="h-1 w-8 rounded-full bg-amber-500/80 mb-2" />
                  <Text className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Fat</Text>
                  <Text className="text-base font-extrabold text-amber-500 mt-1">{formatMacroGrams(today.fat)}g</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      ) : null}

      <Text className="mb-2 mt-6 text-sm text-zinc-400">Meal</Text>
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

      <Button
        className="mt-6"
        label="Log meal"
        onPress={() => void onLogItem()}
        loading={logMutation.isPending}
        disabled={!quickLogHasContent(form)}
      />

      <Button
        variant="secondary"
        className="mt-3"
        label="Log with photo"
        onPress={() =>
          router.push({
            pathname: '/(app)/(tabs)/coach',
            params: { attach: 'camera' } })
        }
      />
      <Text className="mt-1.5 text-center text-xs text-ink-muted">
        Opens Coach camera for meal estimate
      </Text>

      <Text className="mb-2 mt-6 text-sm text-zinc-400">Hydration</Text>
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

      <Button
        variant="secondary"
        className="mt-5"
        label="Open web for planning"
        onPress={() => void openWeb()}
      />
    </View>
  );
}
