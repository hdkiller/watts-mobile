import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { AppSymbol } from '@/src/components/AppSymbol';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

import { NutritionMacroExplainSheet } from './NutritionMacroExplainSheet';
import {
  canExplainMetric,
  emptyQuickLogForm,
  formatMacroGrams,
  goalProgressPct,
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
  MEAL_OPTIONS,
  type MacroExplainLabel,
  type MealSlot,
  type NutritionQuickLogForm,
} from './types';

const HYDRATION_BUTTONS = [
  { ml: 250, label: '+250ml Glass', icon: 'cup.and.saucer' },
  { ml: 500, label: '+500ml Bottle', icon: 'drop' },
  { ml: 750, label: '+750ml Shaker', icon: 'takeoutbag.and.cup.and.straw' },
  { ml: 1000, label: '+1000ml Jug', icon: 'popcorn' },
];

const MEAL_ICONS: Record<MealSlot, { label: string; icon: string }> = {
  BREAKFAST: { label: 'Breakfast', icon: '🥣' },
  LUNCH: { label: 'Lunch', icon: '🥗' },
  DINNER: { label: 'Dinner', icon: '🍽️' },
  SNACK: { label: 'Snack', icon: '🍎' },
  OTHER: { label: 'Other', icon: '🍴' },
};

function GoalBar({ pct, barClassName }: { pct: number | null; barClassName: string }) {
  if (pct == null) return null;
  return (
    <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
      <View className={`h-full rounded-full ${barClassName}`} style={{ width: `${Math.min(100, pct)}%` }} />
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
  onPress,
}: {
  label: string;
  value: number;
  goal: number | null;
  unit: string;
  accentClassName: string;
  barClassName: string;
  onPress?: () => void;
}) {
  const pct = goalProgressPct(value, goal);

  const body = (
    <>
      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {label}
        </Text>
        {pct != null ? (
          <Text className="text-[10px] font-semibold text-text-muted">{pct}%</Text>
        ) : null}
      </View>
      <Text className={`mt-1 text-base font-extrabold ${accentClassName}`}>
        {formatMacroGrams(value)}
        <Text className="text-xs font-semibold text-text-muted">
          {goal != null ? ` / ${formatMacroGrams(goal)}${unit}` : unit}
        </Text>
      </Text>
      <GoalBar pct={pct} barClassName={barClassName} />
    </>
  );

  if (!onPress) {
    return (
      <View className="flex-1 rounded-xl border border-border bg-card p-3">
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} analysis`}
      className="flex-1 rounded-xl border border-border bg-card p-3 active:opacity-80"
      onPress={() => {
        hapticLight();
        onPress();
      }}
    >
      {body}
    </Pressable>
  );
}

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
  const theme = useThemeColors();
  return (
    <View className="mt-3 flex-1">
      <Text className="mb-1 text-xs text-text-muted">{label}</Text>
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
  const profileQuery = useAthleteProfileQuery();

  const [selectedDate, setSelectedDate] = useState(localDateYmd());
  const todayYmd = localDateYmd();
  const isToday = selectedDate === todayYmd;
  // Recompute when the local calendar day rolls so "Yesterday" stays correct overnight.
  const yesterdayYmd = useMemo(() => {
    const d = new Date(`${todayYmd}T12:00:00`);
    d.setDate(d.getDate() - 1);
    return localDateYmd(d);
  }, [todayYmd]);

  const {
    data: today,
    isLoading,
    isError,
    error,
    refetch,
  } = useTodayNutritionQuery(selectedDate);
  const logMutation = useLogNutritionItem();
  const hydrationMutation = useQuickAddHydration();

  const [form, setForm] = useState<NutritionQuickLogForm>(emptyQuickLogForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const [hydrationSaved, setHydrationSaved] = useState<string | null>(null);
  const [explainLabel, setExplainLabel] = useState<MacroExplainLabel | null>(null);

  const openExplain = (label: MacroExplainLabel) => {
    if (!today || !canExplainMetric(today, label)) return;
    setExplainLabel(label);
  };

  const update =
    (key: keyof NutritionQuickLogForm) =>
    (text: string) => {
      setSaved(false);
      setFormError(null);
      setForm((prev) => ({ ...prev, [key]: text }));
    };

  const setMeal = (meal: MealSlot) => {
    hapticLight();
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
      const payload = toNutritionUploadPayload(form);
      payload.date = selectedDate;
      await logMutation.mutateAsync(payload);
      hapticSuccess();
      setForm(emptyQuickLogForm(form.meal));
      setSaved(true);
    } catch (err) {
      setFormError(friendlyError(err, 'Save failed'));
    }
  };

  const onHydration = async (volumeMl: number) => {
    hapticLight();
    setHydrationError(null);
    setHydrationSaved(null);
    try {
      await hydrationMutation.mutateAsync({ date: selectedDate, volumeMl });
      hapticSuccess();
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
        Nutrition Tracker
      </Text>
      <Text className="text-sm text-text-muted">
        Macronutrients, quick meal logging, and hydration history.
      </Text>

      {/* Multi-Day Date Pager Bar */}
      <View className="mt-3 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous day"
          className="p-1 text-text-secondary"
          onPress={() => {
            hapticLight();
            const d = new Date(selectedDate + 'T00:00:00');
            d.setDate(d.getDate() - 1);
            setSelectedDate(localDateYmd(d));
          }}
        >
          <Text className="text-sm font-semibold text-text-secondary">‹ Prev</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset to today"
          className="items-center"
          onPress={() => {
            hapticLight();
            setSelectedDate(localDateYmd());
          }}
        >
          <Text className="text-xs font-bold text-text-primary">
            {isToday
              ? 'Today'
              : selectedDate === yesterdayYmd
              ? 'Yesterday'
              : selectedDate}
          </Text>
          <Text className="text-[10px] text-text-muted">{selectedDate}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next day"
          disabled={isToday}
          className={`p-1.5 ${isToday ? 'opacity-30' : 'active:opacity-70'}`}
          onPress={() => {
            if (isToday) return;
            hapticLight();
            const d = new Date(selectedDate + 'T00:00:00');
            d.setDate(d.getDate() + 1);
            setSelectedDate(localDateYmd(d));
          }}
        >
          <AppSymbol sf="chevron.right" size={16} tintColor={theme.textPrimary} fallback="›" />
        </Pressable>
      </View>

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
              <Text className="text-sm text-text-muted">No meals logged yet today.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {/* Calories & Fluid Card */}
              <View className="flex-row gap-3">
                {canExplainMetric(today, 'Calories') ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Calories analysis"
                    className="flex-1 rounded-xl border border-border bg-card p-3.5 active:opacity-80"
                    onPress={() => openExplain('Calories')}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                        Calories
                      </Text>
                      <AppSymbol sf="flame" size={14} tintColor={Colors.modify} fallback="🔥" />
                    </View>
                    <Text className="mt-2 text-2xl font-black text-text-primary">
                      {today.calories}
                      <Text className="text-xs font-semibold text-text-muted">
                        {today.caloriesGoal != null ? ` / ${today.caloriesGoal} kcal` : ' kcal'}
                      </Text>
                    </Text>
                    <GoalBar
                      pct={goalProgressPct(today.calories, today.caloriesGoal)}
                      barClassName="bg-brand"
                    />
                  </Pressable>
                ) : (
                  <View className="flex-1 rounded-xl border border-border bg-card p-3.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                        Calories
                      </Text>
                      <AppSymbol sf="flame" size={14} tintColor={Colors.modify} fallback="🔥" />
                    </View>
                    <Text className="mt-2 text-2xl font-black text-text-primary">
                      {today.calories}
                      <Text className="text-xs font-semibold text-text-muted"> kcal</Text>
                    </Text>
                  </View>
                )}

                {/* Water Card */}
                <View className="flex-1 rounded-xl border border-border bg-card p-3.5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                      Hydration
                    </Text>
                    <AppSymbol sf="drop.fill" size={14} tintColor="#60a5fa" fallback="💧" />
                  </View>
                  <Text className="mt-2 text-2xl font-black text-text-primary">
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

              {/* Macros Breakdown Row */}
              <View className="flex-row gap-2.5">
                <MacroTile
                  label="Carbs"
                  value={today.carbs}
                  goal={today.carbsGoal}
                  unit="g"
                  accentClassName="text-amber-400"
                  barClassName="bg-amber-400"
                  onPress={
                    canExplainMetric(today, 'Carbs') ? () => openExplain('Carbs') : undefined
                  }
                />
                <MacroTile
                  label="Protein"
                  value={today.protein}
                  goal={today.proteinGoal}
                  unit="g"
                  accentClassName="text-blue-400"
                  barClassName="bg-blue-400"
                  onPress={
                    canExplainMetric(today, 'Protein')
                      ? () => openExplain('Protein')
                      : undefined
                  }
                />
                <MacroTile
                  label="Fat"
                  value={today.fat}
                  goal={today.fatGoal}
                  unit="g"
                  accentClassName="text-violet-400"
                  barClassName="bg-violet-400"
                  onPress={canExplainMetric(today, 'Fat') ? () => openExplain('Fat') : undefined}
                />
              </View>
            </View>
          )}
        </View>
      ) : null}

      <NutritionMacroExplainSheet
        visible={explainLabel != null}
        label={explainLabel}
        day={today ?? null}
        weightKg={profileQuery.data?.weightKg ?? null}
        onClose={() => setExplainLabel(null)}
      />

      {/* Hydration Quick-Add Widget */}
      <View className="mt-6 rounded-xl border border-border bg-card p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-text-primary">Quick Hydration</Text>
          {today?.fluidGoalMl != null ? (
            <Text className="text-xs text-text-muted">
              {today.waterMl >= today.fluidGoalMl
                ? '✓ Goal Reached'
                : `${today.fluidGoalMl - today.waterMl} ml remaining`}
            </Text>
          ) : null}
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {HYDRATION_BUTTONS.map((btn) => (
            <Pressable
              key={btn.ml}
              accessibilityRole="button"
              accessibilityLabel={`Add ${btn.ml} ml hydration`}
              className="flex-1 min-w-[45%] flex-row items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-surface py-2.5 active:opacity-80"
              onPress={() => void onHydration(btn.ml)}
              disabled={hydrationMutation.isPending}
            >
              <Text className="text-xs font-semibold text-text-primary">
                +{btn.ml} ml
              </Text>
            </Pressable>
          ))}
        </View>

        {hydrationMutation.isPending ? (
          <ActivityIndicator className="mt-2" color={Colors.brand} />
        ) : null}
        {hydrationError ? <Text className="mt-2 text-xs text-red-400">{hydrationError}</Text> : null}
        {hydrationSaved ? (
          <Text className="mt-2 text-xs font-semibold text-green-400">{hydrationSaved}</Text>
        ) : null}
      </View>

      {/* Quick Meal Logger Card */}
      <View className="mt-6 rounded-xl border border-border bg-card p-4">
        <Text className="text-sm font-semibold text-text-primary">Quick Log Meal</Text>
        <Text className="mt-1 text-xs text-text-muted">Select meal type and enter items or macros</Text>

        {/* Meal Slot Selector */}
        <View className="mt-3 flex-row gap-2">
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
                  selected
                    ? 'border-brand bg-brand/10'
                    : 'border-border bg-surface'
                }`}
                onPress={() => setMeal(option.value)}
              >
                <Text className="text-base">{meta.icon}</Text>
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

        <View className="mt-3">
          <Text className="mb-1 text-xs text-text-muted">Item Description (optional)</Text>
          <TextInput
            className="rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-base text-text-primary"
            placeholderTextColor={theme.textMuted}
            placeholder="e.g. Oatmeal with blueberries & whey"
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

        {formError ? <Text className="mt-3 text-xs text-red-400">{formError}</Text> : null}
        {saved ? (
          <Text className="mt-3 text-xs font-semibold text-green-400">Logged — totals updated.</Text>
        ) : null}

        <Button
          className="mt-4"
          label="Log meal"
          onPress={() => void onLogItem()}
          loading={logMutation.isPending}
          disabled={!quickLogHasContent(form)}
        />

        <Button
          variant="secondary"
          className="mt-2.5"
          label="Log with AI photo estimate"
          onPress={() =>
            router.push({
              pathname: '/(app)/(tabs)/coach',
              params: { attach: 'camera' },
            })
          }
        />
      </View>

      <Button
        variant="secondary"
        className="mt-6"
        label="Full meal plans & grocery on web"
        onPress={() => void openWeb()}
      />
    </View>
  );
}
