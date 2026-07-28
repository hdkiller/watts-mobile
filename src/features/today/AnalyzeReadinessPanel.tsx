/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Pressable, Text, View } from 'react-native';

import { Spinner } from '@/src/components/Spinner';
import { Button } from '@/src/components/Button';
import { AllowanceHint } from '@/src/features/subscriptions/AllowanceHint';
import { QuotaLimitCard } from '@/src/features/subscriptions/QuotaLimitCard';
import type { QuotaInfo } from '@/src/features/subscriptions/quota';

export type AnalyzeReadinessState = 'idle' | 'generating' | 'error' | 'quota';

type Props = {
  state: AnalyzeReadinessState;
  errorMessage?: string | null;
  /** Structured limit details when `state` is 'quota'. */
  quotaInfo?: QuotaInfo | null;
  generatingPending?: boolean;
  onAnalyze: () => void;
  onOpenWeb: () => void;
  onDismissQuota: () => void;
  onAdhoc?: () => void;
  adhocDisabled?: boolean;
};

const shellByState: Record<AnalyzeReadinessState, string> = {
  idle: 'py-1',
  generating: 'rounded-2xl border border-border bg-card/80 p-5',
  error: 'rounded-2xl border border-danger/40 bg-tint-error p-5',
  quota: '',
};

export function AnalyzeReadinessPanel({
  state,
  errorMessage,
  quotaInfo,
  generatingPending = false,
  onAnalyze,
  onOpenWeb,
  onDismissQuota,
  onAdhoc,
  adhocDisabled = false,
}: Props) {
  return (
    <View testID="today-readiness-panel" className={`mt-6 ${shellByState[state]}`}>
      {state === 'generating' ? (
        <View className="items-center py-2">
          <Spinner size="small" />
          <Text className="mt-3 text-base font-semibold text-text-primary">
            Analyzing readiness…
          </Text>
          <Text className="mt-1 text-center text-sm leading-5 text-text-muted">
            Building today’s recommendation from your latest biometrics
          </Text>
        </View>
      ) : null}

      {state === 'quota' ? (
        <QuotaLimitCard
          info={quotaInfo ?? { feature: 'READINESS_RECOMMENDATION' }}
          surface="today_readiness"
          onDismiss={onDismissQuota}
        />
      ) : null}

      {state === 'error' ? (
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wide text-danger/90">
            Analyze Readiness
          </Text>
          <Text className="mt-2 text-lg font-semibold text-text-primary">
            Couldn’t analyze readiness
          </Text>
          <Text className="mt-2 text-sm leading-5 text-danger">
            {errorMessage || 'Something went wrong. Try again, or continue in Coach Watts.'}
          </Text>
          <View className="mt-5 gap-3">
            <Button label="Try again" onPress={onAnalyze} />
            <Button label="Open Coach Watts" variant="secondary" onPress={onOpenWeb} />
          </View>
        </View>
      ) : null}

      {state === 'idle' ? (
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wide text-brand">
            Today’s Recommendation
          </Text>
          <Text className="mt-1 text-xl font-semibold text-text-primary">Ready when you are</Text>
          <Text className="mt-1.5 text-sm leading-5 text-text-muted">
            Generate today’s recommendation from your latest readiness and recovery biometrics.
          </Text>
          <AllowanceHint className="mt-2" feature="READINESS_RECOMMENDATION" />
          <View className="mt-4 gap-3">
            <Button label="Analyze Readiness" onPress={onAnalyze} loading={generatingPending} />
            {onAdhoc ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Generate Ad-Hoc Workout"
                disabled={adhocDisabled}
                className={`items-center py-2 active:opacity-70 ${adhocDisabled ? 'opacity-50' : ''}`}
                onPress={onAdhoc}
                hitSlop={8}
              >
                <Text className="text-sm font-medium text-text-muted">
                  Or generate an ad-hoc workout →
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
