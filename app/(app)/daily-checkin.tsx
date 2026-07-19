import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { DetailSkeleton } from '@/src/components/Skeleton';
import {
  useDailyCheckinQuery,
  useGenerateDailyCheckin,
  useSubmitDailyCheckin,
} from '@/src/features/log/useDailyCheckin';
import { useTodayQuery } from '@/src/features/today/useToday';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticError, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

export default function DailyCheckinScreen() {
  const todayQuery = useTodayQuery();
  const { data: checkin, isLoading, isError, error, refetch } = useDailyCheckinQuery();
  const generateMutation = useGenerateDailyCheckin();
  const submitMutation = useSubmitDailyCheckin();
  const { containerRef, overlap } = useKeyboardOverlap();

  const [answers, setAnswers] = useState<Record<string, 'YES' | 'NO'>>({});
  const [userNotes, setUserNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const status = checkin?.status;
  const isGenerating = status === 'PENDING' || status === 'PROCESSING';

  // 1. Auto-trigger generation on mount if no check-in exists for today
  useEffect(() => {
    if (!isLoading && !checkin && !generateMutation.isPending && !generateMutation.isError) {
      generateMutation.mutate(false, {
        onError: (err) => {
          setActionError(friendlyError(err, 'Failed to generate questions'));
        },
      });
    }
  }, [checkin, isLoading]);

  // 2. Poll today check-in while it is generating (PENDING / PROCESSING)
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        void refetch();
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  // 3. Prefill answers if check-in questions already carry answers
  useEffect(() => {
    if (checkin?.questions) {
      const prefilled: Record<string, 'YES' | 'NO'> = {};
      checkin.questions.forEach((q) => {
        if (q.answer === 'YES' || q.answer === 'NO') {
          prefilled[q.id] = q.answer;
        }
      });
      setAnswers((prev) => ({ ...prefilled, ...prev }));
      if (checkin.userNotes) {
        setUserNotes(checkin.userNotes);
      }
    }
  }, [checkin]);

  const onAnswer = (qId: string, value: 'YES' | 'NO') => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: value,
    }));
  };

  const onSubmit = async () => {
    if (!checkin?.id) return;
    setActionError(null);
    try {
      await submitMutation.mutateAsync({
        checkinId: checkin.id,
        answers,
        userNotes: userNotes.trim() || undefined,
      });
      hapticSuccess();
      // Invalidate today query so TodayScreen hides the check-in CTA card
      void todayQuery.refetch();
      router.back();
    } catch (err) {
      hapticError();
      setActionError(friendlyError(err, 'Failed to submit check-in'));
    }
  };

  const handleRetryGenerate = () => {
    setActionError(null);
    generateMutation.mutate(true);
  };

  const isCompleted =
    checkin?.questions &&
    checkin.questions.length > 0 &&
    checkin.questions.every((q) => answers[q.id] != null);

  const renderContent = () => {
    if (isLoading || (generateMutation.isPending && !checkin)) {
      return <DetailSkeleton />;
    }

    if (generateMutation.isError || isError) {
      const displayErr = generateMutation.error || error;
      const isQuota =
        displayErr instanceof Error && displayErr.message.includes('Quota');
      return (
        <View className="flex-1 items-center justify-center p-6 bg-surface-dark">
          <Text className="text-lg font-semibold text-white">
            {isQuota ? 'Check-in limit reached' : 'Could not prepare check-in'}
          </Text>
          <Text className="mt-2 text-center text-sm text-red-400">
            {friendlyError(displayErr, 'An error occurred during generation.')}
          </Text>
          <View className="mt-6 w-full gap-3">
            {!isQuota ? (
              <Button label="Try Again" onPress={handleRetryGenerate} />
            ) : null}
            <Button
              label="Go Back"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
        </View>
      );
    }

    if (isGenerating) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-surface-dark">
          <ActivityIndicator color={Colors.brand} size="large" />
          <Text className="mt-4 text-base font-semibold text-white">
            Preparing your questions…
          </Text>
          <Text className="mt-1 text-center text-xs text-ink-muted">
            Coach is analyzing your recent training to tailor today's check-in.
          </Text>
        </View>
      );
    }

    if (!checkin?.questions || checkin.questions.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-surface-dark">
          <Text className="text-base font-semibold text-white">No questions today</Text>
          <Text className="mt-1 text-center text-xs text-ink-muted">
            There are no checklist items required for your session today.
          </Text>
          <Button
            className="mt-6 w-full"
            label="Go Back"
            onPress={() => router.back()}
          />
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1 bg-surface-dark"
        contentContainerClassName="p-6"
        contentContainerStyle={{ paddingBottom: 48 + overlap }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xl font-bold text-white">Daily Coach Check-In</Text>
        <Text className="mt-1 text-sm text-ink-muted">
          Answer YES/NO to help Coach evaluate your readiness and tailor today's training.
        </Text>

        <View className="mt-6 gap-6">
          {checkin.questions.map((q) => {
            const currentAnswer = answers[q.id];
            return (
              <View
                key={q.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <Text className="text-base leading-6 text-zinc-100">{q.text}</Text>
                <View className="mt-4 flex-row gap-3">
                  <Pressable
                    onPress={() => onAnswer(q.id, 'YES')}
                    className={`flex-1 items-center justify-center py-2.5 rounded-lg border ${
                      currentAnswer === 'YES'
                        ? 'border-brand bg-brand/10'
                        : 'border-zinc-800 bg-zinc-900/60'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        currentAnswer === 'YES' ? 'text-brand' : 'text-zinc-400'
                      }`}
                    >
                      YES
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onAnswer(q.id, 'NO')}
                    className={`flex-1 items-center justify-center py-2.5 rounded-lg border ${
                      currentAnswer === 'NO'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-zinc-800 bg-zinc-900/60'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        currentAnswer === 'NO' ? 'text-red-400' : 'text-zinc-400'
                      }`}
                    >
                      NO
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <View className="mt-6">
          <Text className="text-xs uppercase tracking-wide text-ink-muted mb-2">
            Notes for Coach (Optional)
          </Text>
          <TextInput
            className="w-full min-h-[80px] rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-base text-white"
            placeholder="Add context about how you feel, soreness, stress..."
            placeholderTextColor="#71717a"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={userNotes}
            onChangeText={setUserNotes}
          />
        </View>

        {actionError ? (
          <Text className="mt-4 text-sm text-red-400">{actionError}</Text>
        ) : null}

        <Button
          className="mt-8"
          label="Submit Check-In"
          disabled={!isCompleted}
          loading={submitMutation.isPending}
          onPress={onSubmit}
        />
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Daily Coach Check-In',
          headerShown: true,
        }}
      />
      <View ref={containerRef} className="flex-1 bg-surface-dark">
        {renderContent()}
      </View>
    </>
  );
}
