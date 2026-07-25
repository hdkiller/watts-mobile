/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app
 * pre-emit critique: P4 H4 E4 S4 R5 V4 — standing → feed → horizon; Today decides, Strategy explains
 */
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Button } from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';

import { EnergyHorizonChart } from './EnergyHorizonChart';
import { FuelStateExplainSheet } from './FuelStateExplainSheet';
import {
  formatHydrationDebtLiters,
  hydrationStatusLabel,
} from './mapNutritionStrategy';
import {
  useNutritionActiveFeedQuery,
  useNutritionExtendedWaveQuery,
  useNutritionStrategyQuery,
  useResetNutritionHydrationMutation,
} from './useNutrition';

type Props = {
  /** Only fetch while this Strategy segment is focused. */
  enabled: boolean;
};

function BlockError({
  message,
  onRetry,
  testID,
}: {
  message: string;
  onRetry: () => void;
  testID: string;
}) {
  return (
    <View
      testID={testID}
      className="rounded-xl border border-danger/40 bg-tint-error px-3 py-2.5"
    >
      <Text className="text-sm text-danger">{message}</Text>
      <AnimatedPressable hitSlop={8} className="mt-2 self-start" onPress={onRetry}>
        <Text className="text-sm font-semibold text-brand">Retry</Text>
      </AnimatedPressable>
    </View>
  );
}

export function PlanNutritionStrategySegment({ enabled }: Props) {
  const { instanceUrl } = useAuth();
  const strategyQuery = useNutritionStrategyQuery({ enabled });
  const waveQuery = useNutritionExtendedWaveQuery({ enabled });
  const feedQuery = useNutritionActiveFeedQuery({ enabled });
  const resetHydration = useResetNutritionHydrationMutation();
  const [explainOpen, setExplainOpen] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const standing = strategyQuery.data;
  const feed = feedQuery.data;
  const wavePoints = waveQuery.data ?? [];

  const confirmReset = () => {
    Alert.alert(
      'Reset hydration debt?',
      standing?.hydrationFlushPrompt ??
        'This sets today’s starting fluid deficit to zero.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setResetError(null);
            resetHydration.mutate(undefined, {
              onSuccess: () => hapticSuccess(),
              onError: (err) => {
                hapticError();
                setResetError(friendlyError(err, 'Could not reset hydration'));
              },
            });
          },
        },
      ]
    );
  };

  return (
    <View testID="plan-nutrition-strategy" className="gap-5">
      <Text className="text-sm text-text-muted">
        Where you stand — fuel state, hydration, and energy horizon. Today still owns the next
        fueling decision.
      </Text>

      {/* Fuel state */}
      <View className="gap-2" testID="nutrition-strategy-fuel-state">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Fuel state
        </Text>
        {strategyQuery.isLoading && !standing ? (
          <Skeleton className="h-16 rounded-xl" />
        ) : strategyQuery.isError ? (
          <BlockError
            testID="nutrition-strategy-fuel-error"
            message={friendlyError(strategyQuery.error, 'Could not load fuel state')}
            onRetry={() => void strategyQuery.refetch()}
          />
        ) : standing?.todayFuelLabel ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={`Fuel state ${standing.todayFuelLabel}. Explain.`}
            hitSlop={8}
            onPress={() => {
              hapticLight();
              setExplainOpen(true);
            }}
            className="rounded-xl border border-border bg-card/60 px-4 py-3"
          >
            <Text className="text-lg font-semibold text-text-primary">
              {standing.todayFuelLabel}
            </Text>
            {standing.todayCarbsTarget != null ? (
              <Text className="mt-1 text-sm text-text-muted">
                Carb target · {Math.round(standing.todayCarbsTarget)}g
              </Text>
            ) : null}
            <Text className="mt-2 text-sm font-semibold text-brand">Why this state</Text>
          </AnimatedPressable>
        ) : (
          <Text className="text-sm text-text-muted">No fuel state for today yet.</Text>
        )}
        {standing?.summary ? (
          <Text className="text-sm leading-5 text-text-body">{standing.summary}</Text>
        ) : null}
      </View>

      {/* Hydration */}
      <View className="gap-2" testID="nutrition-strategy-hydration">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Hydration
        </Text>
        {strategyQuery.isLoading && !standing ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : strategyQuery.isError ? (
          <BlockError
            testID="nutrition-strategy-hydration-error"
            message={friendlyError(strategyQuery.error, 'Could not load hydration')}
            onRetry={() => void strategyQuery.refetch()}
          />
        ) : standing ? (
          <>
            <View className="flex-row items-end gap-3">
              <Text className="text-3xl font-semibold text-text-primary">
                {formatHydrationDebtLiters(standing.hydrationDebtMl)}
              </Text>
              <Text className="mb-1 text-sm font-semibold text-text-muted">
                {hydrationStatusLabel(standing.hydrationStatus)}
              </Text>
            </View>
            <Text className="text-sm text-text-muted">Fluid debt carried into today</Text>
            {standing.hydrationAdvice ? (
              <Text className="text-sm leading-5 text-text-body">{standing.hydrationAdvice}</Text>
            ) : null}
            {standing.showHydrationFlushPrompt ? (
              <View className="mt-1 gap-2">
                {standing.hydrationFlushPrompt ? (
                  <Text className="text-sm text-text-body">{standing.hydrationFlushPrompt}</Text>
                ) : null}
                <Button
                  label="Reset hydration debt"
                  variant="secondary"
                  testID="nutrition-hydration-reset"
                  loading={resetHydration.isPending}
                  disabled={resetHydration.isPending}
                  onPress={confirmReset}
                />
              </View>
            ) : null}
            {resetError ? <Text className="text-sm text-danger">{resetError}</Text> : null}
          </>
        ) : null}
      </View>

      {/* Active feed — explain standing; do not mirror Today's next-window CTA */}
      <View className="gap-2" testID="nutrition-strategy-active-feed">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Fueling now
        </Text>
        {feedQuery.isLoading && !feed ? (
          <Skeleton className="h-16 rounded-xl" />
        ) : feedQuery.isError ? (
          <BlockError
            testID="nutrition-strategy-feed-error"
            message={friendlyError(feedQuery.error, 'Could not load fueling feed')}
            onRetry={() => void feedQuery.refetch()}
          />
        ) : feed?.empty ? (
          <Text className="text-sm text-text-muted" testID="nutrition-strategy-feed-empty">
            Nothing specific to fuel with right now. Check Today for your next fueling window.
          </Text>
        ) : (
          <View className="gap-3">
            {feed?.entries.map((entry, index) => (
              <View
                key={`${entry.kind}-${entry.title}-${index}`}
                className="border-b border-border/80 pb-3"
              >
                <Text className="text-base font-medium text-text-primary">{entry.title}</Text>
                {entry.detail ? (
                  <Text className="mt-1 text-sm text-text-muted">{entry.detail}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Energy horizon */}
      <View className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Energy horizon
        </Text>
        {waveQuery.isLoading && wavePoints.length === 0 ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : waveQuery.isError ? (
          <BlockError
            testID="nutrition-strategy-horizon-error"
            message={friendlyError(waveQuery.error, 'Could not load energy horizon')}
            onRetry={() => void waveQuery.refetch()}
          />
        ) : wavePoints.length >= 4 ? (
          <>
            <EnergyHorizonChart points={wavePoints} />
            <Text className="text-xs text-text-muted">
              Glycogen trend across yesterday through the next three days.
            </Text>
          </>
        ) : (
          <View testID="nutrition-strategy-horizon-web" className="gap-2">
            <Text className="text-sm text-text-muted">
              This horizon isn’t readable on a phone yet. Open Coach Watts for the full chart.
            </Text>
            <AnimatedPressable
              hitSlop={8}
              onPress={() => void openInstanceWeb(instanceUrl, '/nutrition')}
              accessibilityRole="button"
              accessibilityLabel="Open nutrition strategy on web"
            >
              <Text className="text-sm font-semibold text-brand">Open in Coach Watts</Text>
            </AnimatedPressable>
          </View>
        )}
      </View>

      {standing ? (
        <FuelStateExplainSheet
          visible={explainOpen}
          state={standing.todayFuelState}
          isRest={standing.todayIsRest}
          carbsTarget={standing.todayCarbsTarget}
          onClose={() => setExplainOpen(false)}
        />
      ) : null}
    </View>
  );
}
