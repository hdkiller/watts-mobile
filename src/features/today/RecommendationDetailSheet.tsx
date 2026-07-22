import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/Button';
import { fuelStateLabel } from '@/src/features/nutrition/mapNutrition';
import { useTodayNutritionQuery } from '@/src/features/nutrition/useNutrition';
import { isNutritionTrackingEnabled } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import {
  formatDriverRowText,
  mapRecommendationDrivers,
} from '@/src/features/today/mapRecommendationDrivers';
import {
  heroToneForAction,
  type HeroTone,
} from '@/src/features/today/mapTodayPayload';
import type { RecommendationDetailViewModel } from '@/src/features/today/types';

const BADGE_CLASSES: Record<HeroTone, string> = {
  train: 'bg-brand/20 border-brand/40',
  rest: 'bg-recovery/20 border-recovery/40',
  modify: 'bg-modify/20 border-modify/40',
};

const BADGE_TEXT: Record<HeroTone, string> = {
  train: 'text-brand',
  rest: 'text-recovery',
  modify: 'text-modify',
};

function sourceBadgeClass(sourceType: RecoveryContextItem['sourceType']): string {
  switch (sourceType) {
    case 'imported':
      return 'bg-sky-950/40 border-sky-800/50 text-sky-300';
    case 'manual_event':
      return 'bg-amber-950/40 border-amber-800/50 text-amber-300';
    default:
      return 'bg-green-950/40 border-green-800/50 text-green-300';
  }
}

function PlanCard({
  title,
  durationMin,
  tss,
  description,
  tintClass = 'bg-card/80 border-border',
}: {
  title: string;
  durationMin: number | null;
  tss: number | null;
  description?: string | null;
  tintClass?: string;
}) {
  const meta = [
    durationMin != null ? `${durationMin} min` : null,
    tss != null ? `${Math.round(tss)} TSS` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <View className={`rounded-xl border p-3 ${tintClass}`}>
      <Text className="font-semibold text-text-primary">{title}</Text>
      {meta ? <Text className="mt-1 text-sm text-text-muted">{meta}</Text> : null}
      {description ? (
        <Text className="mt-2 text-sm leading-5 text-text-body">{description}</Text>
      ) : null}
    </View>
  );
}

export function RecommendationDetailSheet({
  visible,
  detail,
  recoveryItems,
  accepting = false,
  onClose,
  onAccept,
}: {
  visible: boolean;
  detail: RecommendationDetailViewModel | null;
  recoveryItems?: RecoveryContextItem[];
  accepting?: boolean;
  onClose: () => void;
  onAccept: () => void;
}) {
  const tone = heroToneForAction(detail?.action);
  const recovery = recoveryItems ?? [];

  const profileQuery = useAthleteProfileQuery();
  const trackingEnabled = isNutritionTrackingEnabled(profileQuery.data);
  const nutritionQuery = useTodayNutritionQuery({
    enabled: visible && trackingEnabled,
  });
  const fuelLabel =
    trackingEnabled && nutritionQuery.data?.fuelState != null
      ? fuelStateLabel(nutritionQuery.data.fuelState)
      : null;

  const drivers = detail
    ? mapRecommendationDrivers({
        recoveryAnalysis: detail.recoveryAnalysis,
        keyFactors: detail.keyFactors,
        fuelStateLabel: fuelLabel,
      })
    : [];
  // Show when there are rows, or when Why? exists so thin-data mornings stay honest.
  const showDriversSection = Boolean(detail) && (drivers.length > 0 || Boolean(detail?.reasoning));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
        <View className="flex-row items-start justify-between border-b border-border px-5 py-4">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-xl font-semibold text-text-primary">
              Today’s Training Recommendation
            </Text>
            <Text className="mt-1 text-sm leading-5 text-text-muted">
              In-depth breakdown of your daily training recommendation. Suggested changes are only
              applied if you explicitly accept them.
            </Text>
          </View>
          <Pressable onPress={onClose} className="active:opacity-70" hitSlop={8}>
            <Text className="text-sm font-semibold text-brand">Close</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-5">
          {!detail ? (
            <Text className="text-sm text-text-muted">No recommendation details available.</Text>
          ) : (
            <View className="gap-5">
              <View className="items-center">
                <View
                  className={`rounded-2xl border px-4 py-2 ${BADGE_CLASSES[tone]}`}
                  accessibilityRole="text"
                >
                  <Text className={`text-lg font-semibold ${BADGE_TEXT[tone]}`}>
                    {detail.actionLabel}
                  </Text>
                </View>
                {detail.confidencePercent != null ? (
                  <Text className="mt-2 text-sm text-text-muted">
                    Confidence: {detail.confidencePercent}%
                  </Text>
                ) : null}
              </View>

              {detail.reasoning ? (
                <View>
                  <Text className="mb-2 text-base font-semibold text-text-primary">Why?</Text>
                  <Text className="text-sm leading-5 text-text-body">{detail.reasoning}</Text>
                </View>
              ) : null}

              {recovery.length > 0 ? (
                <View>
                  <Text className="mb-2 text-base font-semibold text-text-primary">
                    Recovery Context
                  </Text>
                  <View className="gap-2">
                    {recovery.map((item) => (
                      <View
                        key={item.id}
                        className="rounded-xl border border-border bg-card/80 px-3 py-3"
                      >
                        <View className="flex-row flex-wrap items-center gap-2">
                          <Text className="text-sm font-medium text-text-primary">{item.label}</Text>
                          <View
                            className={`rounded-full border px-2 py-0.5 ${sourceBadgeClass(item.sourceType)}`}
                          >
                            <Text className="text-xs">{item.origin}</Text>
                          </View>
                        </View>
                        <Text className="mt-1 text-sm text-text-muted">
                          {item.description || 'Logged in today’s recovery.'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {showDriversSection ? (
                <View>
                  <Text className="mb-1 text-base font-semibold text-text-primary">
                    What drove this
                  </Text>
                  <Text className="mb-2 text-xs leading-4 text-text-muted">
                    Inputs Coach Watts used for this recommendation — not live device readings.
                  </Text>
                  {drivers.length > 0 ? (
                    <View className="gap-1.5">
                      {drivers.map((row) => (
                        <View key={row.id} className="flex-row gap-2">
                          <Text className="text-sm text-text-muted">›</Text>
                          <Text className="flex-1 text-sm leading-5 text-text-body">
                            {formatDriverRowText(row)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-sm leading-5 text-text-muted">
                      Limited inputs for this recommendation.
                    </Text>
                  )}
                </View>
              ) : null}

              {detail.originalPlan ? (
                <View>
                  <Text className="mb-2 text-base font-semibold text-text-primary">Original Plan</Text>
                  <PlanCard
                    title={detail.originalPlan.title}
                    durationMin={detail.originalPlan.durationMin}
                    tss={detail.originalPlan.tss}
                  />
                </View>
              ) : null}

              {detail.suggestedChanges ? (
                <View>
                  <Text className="mb-2 text-base font-semibold text-text-primary">
                    Suggested Changes
                  </Text>
                  <PlanCard
                    title={detail.suggestedChanges.title || 'Suggested change'}
                    durationMin={detail.suggestedChanges.durationMin}
                    tss={detail.suggestedChanges.tss}
                    description={detail.suggestedChanges.description}
                    tintClass="border-sky-800/40 bg-sky-950/25"
                  />
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>

        <View className="gap-3 border-t border-border px-5 py-4">
          {detail?.canAccept ? (
            <Button label="Accept Changes" onPress={onAccept} loading={accepting} />
          ) : null}
          <Button variant="secondary" label="Close" onPress={onClose} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
