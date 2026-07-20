import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { isNutritionTrackingEnabled } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { Colors } from '@/src/theme/colors';

import { formatMacroGrams } from './mapNutrition';
import { useTodayNutritionQuery } from './useNutrition';

function openNutritionLog() {
  router.push('/(app)/(tabs)/log?section=nutrition' as Href);
}

/** Thin Today fueling glance when nutrition tracking is enabled. Writes stay on Log. */
export function NutritionGlance() {
  const profileQuery = useAthleteProfileQuery();
  const trackingEnabled = isNutritionTrackingEnabled(profileQuery.data);
  const { data: today, isLoading, isError } = useTodayNutritionQuery({
    enabled: trackingEnabled,
  });

  if (!trackingEnabled) return null;
  if (isError) return null;

  return (
    <View className="mt-8">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Nutrition
        </Text>
        <Pressable className="py-1 active:opacity-70" onPress={openNutritionLog}>
          <Text className="text-sm font-semibold text-brand">Log meal</Text>
        </Pressable>
      </View>

      {isLoading && !today ? (
        <ActivityIndicator className="mt-3" color={Colors.brand} />
      ) : (
        <Pressable
          className="mt-3 rounded-xl border border-border bg-card/60 px-4 py-3 active:opacity-80"
          onPress={openNutritionLog}
        >
          {!today || today.isEmpty ? (
            <Text className="text-sm text-text-muted">No fuel logged yet today.</Text>
          ) : (
            <>
              <Text className="text-lg font-semibold text-text-primary">{today.calories} kcal</Text>
              <Text className="mt-1 text-sm text-text-muted">
                P {formatMacroGrams(today.protein)}g · C {formatMacroGrams(today.carbs)}g · F{' '}
                {formatMacroGrams(today.fat)}g
              </Text>
            </>
          )}
          {today && today.waterMl > 0 ? (
            <Text className="mt-2 text-sm text-text-primary">
              Water {(today.waterMl / 1000).toFixed(1)} L
            </Text>
          ) : null}
        </Pressable>
      )}
    </View>
  );
}
