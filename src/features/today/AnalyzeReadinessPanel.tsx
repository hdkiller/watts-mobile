import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { Colors } from '@/src/theme/colors';

export type AnalyzeReadinessState = 'idle' | 'generating' | 'error' | 'quota';

type Props = {
  state: AnalyzeReadinessState;
  errorMessage?: string | null;
  generatingPending?: boolean;
  onAnalyze: () => void;
  onOpenWeb: () => void;
  onDismissQuota: () => void;
};

const shellByState: Record<AnalyzeReadinessState, string> = {
  idle: 'border-border bg-card/80',
  generating: 'border-border bg-card/80',
  error: 'border-danger/40 bg-tint-error',
  quota: 'border-amber-900/40 bg-amber-950/25',
};

export function AnalyzeReadinessPanel({
  state,
  errorMessage,
  generatingPending = false,
  onAnalyze,
  onOpenWeb,
  onDismissQuota,
}: Props) {
  return (
    <View className={`mt-6 rounded-2xl border p-5 ${shellByState[state]}`}>
      {state === 'generating' ? (
        <View className="items-center py-2">
          <ActivityIndicator color={Colors.brand} size="small" />
          <Text className="mt-3 text-base font-semibold text-text-primary">Analyzing readiness…</Text>
          <Text className="mt-1 text-center text-sm leading-5 text-text-muted">
            Building today’s recommendation from your latest biometrics
          </Text>
        </View>
      ) : null}

      {state === 'quota' ? (
        <View>
          <Text className="text-xs uppercase tracking-wide text-modify">Plan limit</Text>
          <Text className="mt-2 text-lg font-semibold text-text-primary">Recommendation limit reached</Text>
          <Text className="mt-2 text-sm leading-5 text-text-body">
            {errorMessage || 'Update your plan in Coach Watts to generate more recommendations.'}
          </Text>
          <View className="mt-5 gap-3">
            <Button label="Open Coach Watts" onPress={onOpenWeb} />
            <Button label="Back" variant="secondary" onPress={onDismissQuota} />
          </View>
        </View>
      ) : null}

      {state === 'error' ? (
        <View>
          <Text className="text-xs uppercase tracking-wide text-red-400/90">Analyze Readiness</Text>
          <Text className="mt-2 text-lg font-semibold text-text-primary">Couldn’t analyze readiness</Text>
          <Text className="mt-2 text-sm leading-5 text-red-300">
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
          <Text className="text-xs uppercase tracking-wide text-text-muted">Ready when you are</Text>
          <Text className="mt-2 text-lg font-semibold text-text-primary">No recommendation yet</Text>
          <Text className="mt-2 text-sm leading-5 text-text-muted">
            Generate today’s recommendation from your latest readiness and recovery.
          </Text>
          <View className="mt-5 gap-3">
            <Button label="Analyze Readiness" onPress={onAnalyze} loading={generatingPending} />
            <Button label="Open Coach Watts" variant="secondary" onPress={onOpenWeb} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
