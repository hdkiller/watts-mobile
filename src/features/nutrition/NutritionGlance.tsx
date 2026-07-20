import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

import { isNutritionTrackingEnabled } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

import { formatMacroGrams, formatWindowTime, fuelStateLabel, goalProgressPct } from './mapNutrition';
import { useNextFuelingWindowQuery, useTodayNutritionQuery } from './useNutrition';

function openNutritionLog() {
  router.push('/(app)/(tabs)/log?section=nutrition' as Href);
}

function GoalBar({ pct, color }: { pct: number | null; theme: ReturnType<typeof useThemeColors>; color: string }) {
  if (pct == null) return null;
  return (
    <View className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
      <View style={{ width: `${pct}%`, backgroundColor: color }} className="h-1 rounded-full" />
    </View>
  );
}

function MacroColumn({
  label,
  value,
  goal,
  color,
  theme,
}: {
  label: string;
  value: number;
  goal: number | null;
  color: string;
  theme: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View className="flex-1">
      <Text className="text-sm text-text-muted">{label}</Text>
      <Text className="mt-1 text-base font-semibold text-text-primary">
        {formatMacroGrams(value)}
        <Text className="text-sm font-normal text-text-muted">
          {goal != null ? ` / ${formatMacroGrams(goal)} g` : ' g'}
        </Text>
      </Text>
      <GoalBar pct={goalProgressPct(value, goal)} theme={theme} color={color} />
    </View>
  );
}

/** Today fueling glance when nutrition tracking is enabled. Writes stay on Log. */
export function NutritionGlance() {
  const theme = useThemeColors();
  const profileQuery = useAthleteProfileQuery();
  const trackingEnabled = isNutritionTrackingEnabled(profileQuery.data);
  const { data: today, isLoading, isError } = useTodayNutritionQuery({
    enabled: trackingEnabled,
  });
  const { data: nextWindow } = useNextFuelingWindowQuery({ enabled: trackingEnabled });

  if (!trackingEnabled) return null;
  if (isError) return null;

  const hasGoals = today?.hasGoals ?? false;

  return (
    <View className="mt-8">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Today’s fuel
        </Text>
        <Pressable className="py-1 active:opacity-70" onPress={openNutritionLog}>
          <Text className="text-sm font-semibold text-brand">Log meal</Text>
        </Pressable>
      </View>

      {isLoading && !today ? (
        <ActivityIndicator className="mt-3" color={Colors.brand} />
      ) : (
        <Pressable
          className="mt-3 rounded-xl border border-border bg-card/60 px-4 py-3.5 active:opacity-80"
          onPress={openNutritionLog}
        >
          {!today || (today.isEmpty && !hasGoals) ? (
            <Text className="text-sm text-text-muted">No fuel logged yet today.</Text>
          ) : (
            <>
              {today.fuelState != null ? (
                <View className="mb-2.5 flex-row justify-end">
                  <View className="rounded-full bg-tint-success px-2.5 py-1">
                    <Text className="text-xs font-semibold text-success">
                      {fuelStateLabel(today.fuelState)}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View className="flex-row items-baseline justify-between">
                <Text className="text-2xl font-semibold text-text-primary">
                  {today.calories}
                  <Text className="text-base font-normal text-text-muted">
                    {today.caloriesGoal != null ? ` / ${today.caloriesGoal} kcal` : ' kcal'}
                  </Text>
                </Text>
                {today.caloriesGoal != null ? (
                  <Text className="text-sm text-text-muted">
                    {Math.max(0, today.caloriesGoal - today.calories)} left
                  </Text>
                ) : null}
              </View>
              <GoalBar
                pct={goalProgressPct(today.calories, today.caloriesGoal)}
                theme={theme}
                color={Colors.brand}
              />

              <View className="mt-4 flex-row gap-4">
                <MacroColumn
                  label="Carbs"
                  value={today.carbs}
                  goal={today.carbsGoal}
                  color="#fbbf24"
                  theme={theme}
                />
                <MacroColumn
                  label="Protein"
                  value={today.protein}
                  goal={today.proteinGoal}
                  color="#60a5fa"
                  theme={theme}
                />
                <MacroColumn
                  label="Fat"
                  value={today.fat}
                  goal={today.fatGoal}
                  color="#a78bfa"
                  theme={theme}
                />
              </View>

              <View className="mt-3.5 flex-row items-center gap-2">
                {Platform.OS === 'ios' ? (
                  <SymbolView name="drop.fill" size={13} tintColor="#60a5fa" />
                ) : (
                  <Text className="text-xs">💧</Text>
                )}
                <Text className="text-sm font-semibold text-text-primary">
                  {today.waterMl}
                  <Text className="text-sm font-normal text-text-muted">
                    {today.fluidGoalMl != null ? ` / ${today.fluidGoalMl} ml` : ' ml'}
                  </Text>
                </Text>
                <View className="flex-1">
                  <GoalBar
                    pct={goalProgressPct(today.waterMl, today.fluidGoalMl)}
                    theme={theme}
                    color="#60a5fa"
                  />
                </View>
              </View>
            </>
          )}

          {nextWindow ? (
            <View className="mt-3.5 flex-row items-center border-t border-border pt-3">
              {Platform.OS === 'ios' ? (
                <SymbolView name="clock.fill" size={14} tintColor={theme.textMuted} />
              ) : (
                <Text className="text-xs text-text-muted">⏱</Text>
              )}
              <View className="ml-2 flex-1">
                <Text className="text-xs text-text-muted">
                  Next window · {nextWindow.label} {formatWindowTime(nextWindow.startTime)}
                </Text>
                <Text className="mt-0.5 text-sm font-semibold text-text-primary">
                  {nextWindow.targetCarbs} g carbs · {nextWindow.targetProtein} g protein
                </Text>
              </View>
              {Platform.OS === 'ios' ? (
                <SymbolView name="chevron.right" size={12} tintColor={theme.textMuted} />
              ) : null}
            </View>
          ) : null}
        </Pressable>
      )}
    </View>
  );
}
