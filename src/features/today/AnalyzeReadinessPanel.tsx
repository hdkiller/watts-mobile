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
  idle: 'border-zinc-800 bg-zinc-900/80',
  generating: 'border-zinc-800 bg-zinc-900/80',
  error: 'border-red-900/50 bg-red-950/40',
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
          <Text className="mt-3 text-base font-semibold text-white">Analyzing readiness…</Text>
          <Text className="mt-1 text-center text-sm leading-5 text-ink-muted">
            Building today’s recommendation from your latest biometrics
          </Text>
        </View>
      ) : null}

      {state === 'quota' ? (
        <View>
          <Text className="text-xs uppercase tracking-wide text-modify">Plan limit</Text>
          <Text className="mt-2 text-lg font-semibold text-white">Recommendation limit reached</Text>
          <Text className="mt-2 text-sm leading-5 text-zinc-300">
            {errorMessage || 'Update your plan on the web to generate more recommendations.'}
          </Text>
          <View className="mt-5 gap-3">
            <Button label="Open web" onPress={onOpenWeb} />
            <Button label="Back" variant="secondary" onPress={onDismissQuota} />
          </View>
        </View>
      ) : null}

      {state === 'error' ? (
        <View>
          <Text className="text-xs uppercase tracking-wide text-red-400/90">Analyze Readiness</Text>
          <Text className="mt-2 text-lg font-semibold text-white">Couldn’t analyze readiness</Text>
          <Text className="mt-2 text-sm leading-5 text-red-300">
            {errorMessage || 'Something went wrong. Try again, or continue on the web.'}
          </Text>
          <View className="mt-5 gap-3">
            <Button label="Try again" onPress={onAnalyze} />
            <Button label="Open web" variant="secondary" onPress={onOpenWeb} />
          </View>
        </View>
      ) : null}

      {state === 'idle' ? (
        <View>
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Ready when you are</Text>
          <Text className="mt-2 text-lg font-semibold text-white">No recommendation yet</Text>
          <Text className="mt-2 text-sm leading-5 text-ink-muted">
            Generate today’s personalized call from your latest biometrics and recovery context.
          </Text>
          <View className="mt-5 gap-3">
            <Button label="Analyze Readiness" onPress={onAnalyze} loading={generatingPending} />
            <Button label="Open web" variant="secondary" onPress={onOpenWeb} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
