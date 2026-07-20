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
import { useThemeColors } from '@/src/theme/useThemeColors';

import {
  emptyQuickLogForm,
  formatMacroGrams,
  goalProgressPct,
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

function GoalBar({ pct, barClassName }: { pct: number | null; barClassName: string }) {
  if (pct == null) return null;
  return (
    <View className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
      <View className={`h-1 rounded-full ${barClassName}`} style={{ width: `${pct}%` }} />
    </View>
  );
}

function MacroTile({
  label,
  value,
  goal,
  unit,
  accentClassName,
  barClassName,
}: {
  label: string;
  value: number;
  goal: number | null;
  unit: string;
  accentClassName: string;
  barClassName: string;
}) {
  return (
    <View className="flex-1 items-center rounded-xl border border-border/60 bg-card/30 p-3 shadow-sm">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
        {label}
      </Text>
      <Text className={`mt-1 text-base font-extrabold ${accentClassName}`}>
        {formatMacroGrams(value)}
        <Text className="text-xs font-semibold text-text-muted">
          {goal != null ? ` / ${formatMacroGrams(goal)}${unit}` : unit}
        </Text>
      </Text>
      <GoalBar pct={goalProgressPct(value, goal)} barClassName={barClassName} />
    </View>
  );
}

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
  const theme = useThemeColors();
  return (
    <View className="mt-3 flex-1">
      <Text className="mb-1.5 text-xs text-text-muted">{label}</Text>
      <TextInput
        className="rounded-xl border border-border-strong bg-card px-3 py-2.5 text-base text-text-primary"
        placeholderTextColor={theme.textMuted}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
      />
    </View>
  );
}

export function NutritionSection() {
  const theme = useThemeColors();

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
      <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
        Nutrition
      </Text>
      <Text className="text-sm text-text-muted">
        Today’s totals, quick meal log, and hydration. Planning and grocery stay on web.
      </Text>

      {isLoading && !today ? (
        <ActivityIndicator className="mt-4" color={Colors.brand} />
      ) : null}

      {isError ? (
        <View className="mt-3 rounded-xl border border-danger/40 bg-tint-error p-3">
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
          {today.isEmpty && !today.hasGoals ? (
            <View className="rounded-xl border border-border bg-card px-4 py-4">
              <Text className="text-sm text-text-muted">No nutrition logged yet today — start below.</Text>
            </View>
          ) : (
            <View className="gap-3">
              <View className="flex-row gap-3">
                {/* Calories Tile */}
                <View className="flex-1 rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-sm">
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Calories</Text>
                  <Text className="text-2xl font-black text-text-primary mt-2">
                    {today.calories}
                    <Text className="text-xs font-semibold text-text-muted">
                      {today.caloriesGoal != null ? ` / ${today.caloriesGoal} kcal` : ' kcal'}
                    </Text>
                  </Text>
                  <GoalBar
                    pct={goalProgressPct(today.calories, today.caloriesGoal)}
                    barClassName="bg-brand"
                  />
                </View>
                {/* Water Tile */}
                <View className="flex-1 rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-sm">
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Water</Text>
                  <Text className="text-2xl font-black text-text-primary mt-2">
                    {(today.waterMl / 1000).toFixed(1)}
                    <Text className="text-xs font-semibold text-text-muted">
                      {today.fluidGoalMl != null
                        ? ` / ${(today.fluidGoalMl / 1000).toFixed(1)} L`
                        : ' L'}
                    </Text>
                  </Text>
                  <GoalBar
                    pct={goalProgressPct(today.waterMl, today.fluidGoalMl)}
                    barClassName="bg-blue-400"
                  />
                </View>
              </View>
              {/* Macros Row */}
              <View className="flex-row gap-2.5">
                <MacroTile
                  label="Carbs"
                  value={today.carbs}
                  goal={today.carbsGoal}
                  unit="g"
                  accentClassName="text-amber-400"
                  barClassName="bg-amber-400"
                />
                <MacroTile
                  label="Protein"
                  value={today.protein}
                  goal={today.proteinGoal}
                  unit="g"
                  accentClassName="text-blue-400"
                  barClassName="bg-blue-400"
                />
                <MacroTile
                  label="Fat"
                  value={today.fat}
                  goal={today.fatGoal}
                  unit="g"
                  accentClassName="text-violet-400"
                  barClassName="bg-violet-400"
                />
              </View>
            </View>
          )}
        </View>
      ) : null}

      <Text className="mb-2 mt-6 text-sm text-text-muted">Meal</Text>
      <View className="flex-row flex-wrap">
        {MEAL_OPTIONS.map((option) => {
          const selected = form.meal === option.value;
          return (
            <Pressable
              key={option.value}
              className={`mb-2 mr-2 rounded-full border px-3 py-2 ${
                selected ? 'border-brand bg-brand/20' : 'border-border-strong bg-card'
              }`}
              onPress={() => setMeal(option.value)}
            >
              <Text className={`text-xs font-semibold ${selected ? 'text-brand' : 'text-text-primary'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-2">
        <Text className="mb-1.5 text-xs text-text-muted">Name (optional)</Text>
        <TextInput
          className="rounded-xl border border-border-strong bg-card px-3 py-2.5 text-base text-text-primary"
          placeholderTextColor={theme.textMuted}
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
          placeholder="kcal"
        />
        <MacroField
          label="Protein (g)"
          value={form.protein}
          onChangeText={update('protein')}
          placeholder="g"
        />
      </View>
      <View className="flex-row gap-2">
        <MacroField
          label="Carbs (g)"
          value={form.carbs}
          onChangeText={update('carbs')}
          placeholder="g"
        />
        <MacroField
          label="Fat (g)"
          value={form.fat}
          onChangeText={update('fat')}
          placeholder="g"
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
      <Text className="mt-1.5 text-center text-xs text-text-muted">
        Opens Coach camera for meal estimate
      </Text>

      <Text className="mb-2 mt-6 text-sm text-text-muted">Hydration</Text>
      {today && today.fluidGoalMl != null ? (
        <View className="mb-3">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-base font-semibold text-text-primary">
              {today.waterMl}
              <Text className="text-sm font-normal text-text-muted"> / {today.fluidGoalMl} ml</Text>
            </Text>
            <Text className="text-xs font-semibold text-text-muted">
              {goalProgressPct(today.waterMl, today.fluidGoalMl)}%
            </Text>
          </View>
          <GoalBar
            pct={goalProgressPct(today.waterMl, today.fluidGoalMl)}
            barClassName="bg-blue-400"
          />
          <Text className="mt-2 text-xs text-text-muted">
            {today.waterMl >= today.fluidGoalMl
              ? 'Target hit — keep sipping as needed.'
              : `${today.fluidGoalMl - today.waterMl} ml left to hit today’s target.`}
          </Text>
        </View>
      ) : null}
      <View className="flex-row flex-wrap">
        {HYDRATION_QUICK_ML.map((ml) => (
          <Pressable
            key={ml}
            className="mb-2 mr-2 rounded-full border border-border-strong bg-card px-3 py-2 active:opacity-80"
            onPress={() => void onHydration(ml)}
            disabled={hydrationMutation.isPending}
          >
            <Text className="text-xs font-semibold text-text-primary">+{ml} ml</Text>
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
