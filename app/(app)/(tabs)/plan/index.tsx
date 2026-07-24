/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { useActivationStatus } from '@/src/features/activation/useActivationStatus';
import { NUTRITION_PLAN_KEY } from '@/src/features/nutrition/useNutrition';
import { PlanNutritionSegment } from '@/src/features/plans/PlanNutritionSegment';
import { PlanTrainingSegment } from '@/src/features/plans/PlanTrainingSegment';
import { PLAN_WEEK_SESSIONS_QUERY_KEY, useActivePlanQuery } from '@/src/features/plans/usePlans';
import { useOfflineCached } from '@/src/hooks/useOfflineCached';
import { hapticLight } from '@/src/lib/haptics';

type PlanSegment = 'training' | 'nutrition';

function PlanModeSegment({
  mode,
  onChange,
}: {
  mode: PlanSegment;
  onChange: (mode: PlanSegment) => void;
}) {
  return (
    <View testID="plan-mode" className="flex-row items-center gap-4 px-6 pt-3">
      {(['training', 'nutrition'] as const).map((value) => {
        const selected = mode === value;
        const label = value === 'training' ? 'Training' : 'Nutrition';
        return (
          <AnimatedPressable
            key={value}
            testID={`plan-mode-${value}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            hitSlop={8}
            onPress={() => {
              if (value === mode) return;
              hapticLight();
              onChange(value);
            }}
            className="py-1"
          >
            <Text
              className={`text-sm font-semibold ${
                selected ? 'text-text-primary' : 'text-text-muted'
              }`}
            >
              {label}
            </Text>
            <View
              className={`mt-1 h-0.5 w-full rounded-full ${selected ? 'bg-brand' : 'bg-transparent'}`}
            />
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

export default function PlanTabScreen() {
  const [mode, setMode] = useState<PlanSegment>('training');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { data: activation } = useActivationStatus();
  const hasUsableData = activation?.hasUsableData;
  const plan = useActivePlanQuery({ hasUsableData });
  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data: plan.data,
    isError: plan.isError,
    dataUpdatedAt: plan.dataUpdatedAt,
  });

  const refetchAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        plan.refetch(),
        queryClient.invalidateQueries({ queryKey: PLAN_WEEK_SESSIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: NUTRITION_PLAN_KEY }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View testID="plan-screen" className="flex-1 bg-surface">
      <OfflineBanner visible={showCachedOffline} lastUpdatedLabel={lastUpdatedLabel} />
      <PlanModeSegment mode={mode} onChange={setMode} />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refetchAll()} />}
      >
        {mode === 'training' ? (
          <PlanTrainingSegment
            shell={plan.data?.shell ?? null}
            loading={plan.isLoading}
            error={plan.isError ? plan.error : null}
            onRetry={() => void plan.refetch()}
            hasUsableData={hasUsableData}
          />
        ) : (
          <PlanNutritionSegment />
        )}
      </ScrollView>
    </View>
  );
}
