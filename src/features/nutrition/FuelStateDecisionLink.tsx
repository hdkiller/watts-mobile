import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { isNutritionTrackingEnabled } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { hapticLight } from '@/src/lib/haptics';

import { fuelStateLabel } from './mapNutrition';
import { useTodayNutritionQuery } from './useNutrition';

/**
 * Compact Today decision-band fuel state.
 *
 * Tap destination: Log nutrition (`?section=nutrition`) — write path stays Log-first.
 * Macro explain sheets stay on NutritionGlance / Log tiles (nutrition-summary-detail-modals);
 * this chip does not open explain so the decision link remains one clear destination.
 */
export function FuelStateDecisionLink() {
  const profileQuery = useAthleteProfileQuery();
  const trackingEnabled = isNutritionTrackingEnabled(profileQuery.data);
  const { data: today } = useTodayNutritionQuery({ enabled: trackingEnabled });

  if (!trackingEnabled) return null;
  if (today?.fuelState == null) return null;

  const label = fuelStateLabel(today.fuelState);

  return (
    <View className="mt-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Fueling, ${label}. Open nutrition log`}
        className="flex-row items-center self-start rounded-full border border-border bg-card/60 px-3 py-1.5 active:opacity-70"
        onPress={() => {
          hapticLight();
          router.push('/(app)/(tabs)/log?section=nutrition' as Href);
        }}
      >
        <Text className="text-xs font-semibold text-text-muted">Fueling</Text>
        <Text className="ml-1.5 text-xs font-semibold text-text-primary">· {label}</Text>
      </Pressable>
    </View>
  );
}
