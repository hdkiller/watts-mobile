import { Stack, router, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { DetailSkeleton } from '@/src/components/Skeleton';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { isDailyCheckinCompleted } from '@/src/features/log/isDailyCheckinCompleted';
import {
  useDailyCheckinQuery,
  useGenerateDailyCheckin,
  useSubmitDailyCheckin,
} from '@/src/features/log/useDailyCheckin';
import { useTodayQuery } from '@/src/features/today/useToday';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { hapticLight, hapticError, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

const POLL_MS = 2500;
const MAX_POLL_ATTEMPTS = 30; // ~75s

export default function DailyCheckinScreen() {
  const { instanceUrl } = useAuth();
  const todayQuery = useTodayQuery();
  const { data: checkin, isLoading, isError, error, refetch } = useDailyCheckinQuery();
  const generateMutation = useGenerateDailyCheckin();
  const submitMutation = useSubmitDailyCheckin();
  const { containerRef, overlap } = useKeyboardOverlap();

  const [answers, setAnswers] = useState<Record<string, 'YES' | 'NO'>>({});
  const [userNotes, setUserNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const pollAttemptsRef = useRef(0);

  const status = checkin?.status;
  const isGenerating = status === 'PENDING' || status === 'PROCESSING';

  // 1. Auto-trigger generation on mount if no check-in exists for today
  useEffect(() => {
    if (!isLoading && !checkin && !generateMutation.isPending && !generateMutation.isError) {
      setTimedOut(false);
      pollAttemptsRef.current = 0;
      generateMutation.mutate(false, {
        onError: (err) => {
          setActionError(friendlyError(err, 'Failed to generate questions'));
        },
      });
    }
  }, [checkin, isLoading]);

  // 2. Poll today check-in while generating; cap ~75s then offer Retry / Open web
  useEffect(() => {
    if (!isGenerating) {
      pollAttemptsRef.current = 0;
      return;
    }
    const interval = setInterval(() => {
      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(interval);
        setTimedOut(true);
        return;
      }
      void refetch();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [isGenerating, refetch]);

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
    hapticLight();
    setAnswers((prev) => ({
      ...prev,
      [qId]: value,
    }));
  };

  const openWeb = () => void openInstanceWeb(instanceUrl, '/');

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
      void todayQuery.refetch();
      router.back();
    } catch (err) {
      hapticError();
      setActionError(friendlyError(err, 'Failed to submit check-in'));
    }
  };

  const handleRetryGenerate = () => {
    setActionError(null);
    setTimedOut(false);
    pollAttemptsRef.current = 0;
    generateMutation.mutate(true);
  };

  const allAnswered =
    checkin?.questions &&
    checkin.questions.length > 0 &&
    checkin.questions.every((q) => answers[q.id] != null);

  const renderContent = () => {
    if (isLoading || (generateMutation.isPending && !checkin)) {
      return <DetailSkeleton />;
    }

    if (timedOut && isGenerating) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-surface">
          <Text className="text-lg font-semibold text-text-primary">Still preparing…</Text>
          <Text className="mt-2 text-center text-sm text-red-400">
            Check-in generation timed out. Retry or continue in Coach Watts.
          </Text>
          <View className="mt-6 w-full gap-3">
            <Button label="Try Again" onPress={handleRetryGenerate} />
            <Button label="Open Coach Watts" variant="secondary" onPress={openWeb} />
            <Button label="Go Back" variant="secondary" onPress={() => router.back()} />
          </View>
        </View>
      );
    }

    if (generateMutation.isError || isError) {
      const displayErr = generateMutation.error || error;
      const isQuota =
        displayErr instanceof Error && displayErr.message.includes('Quota');
      return (
        <View className="flex-1 items-center justify-center p-6 bg-surface">
          <Text className="text-lg font-semibold text-text-primary">
            {isQuota ? 'Check-in limit reached' : 'Could not prepare check-in'}
          </Text>
          <Text className="mt-2 text-center text-sm text-red-400">
            {friendlyError(displayErr, 'An error occurred during generation.')}
          </Text>
          <View className="mt-6 w-full gap-3">
            {!isQuota ? (
              <Button label="Try Again" onPress={handleRetryGenerate} />
            ) : null}
            <Button label="Open Coach Watts" variant="secondary" onPress={openWeb} />
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
        <View className="flex-1 items-center justify-center p-6 bg-surface">
          <ActivityIndicator color={Colors.brand} size="large" />
          <Text className="mt-4 text-base font-semibold text-text-primary">
            Preparing your questions…
          </Text>
          <Text className="mt-1 text-center text-xs text-text-muted">
            Coach is analyzing your recent training to tailor today's check-in.
          </Text>
        </View>
      );
    }

    if (!checkin?.questions || checkin.questions.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-surface">
          <Text className="text-base font-semibold text-text-primary">Nothing to check in today</Text>
          <Text className="mt-2 text-center text-sm text-text-muted">
            Coach will ask when it matters.
          </Text>
          <View className="mt-6 w-full gap-3">
            <Button
              label="Log wellness instead"
              onPress={() => router.replace('/(app)/(tabs)/log?section=wellness' as Href)}
            />
            <Button
              label="Generate questions"
              variant="secondary"
              loading={generateMutation.isPending}
              onPress={handleRetryGenerate}
            />
            <Button label="Go Back" variant="secondary" onPress={() => router.back()} />
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="p-6"
        contentContainerStyle={{ paddingBottom: 48 + overlap }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xl font-bold text-text-primary">Daily Coach Check-In</Text>
        <Text className="mt-1 text-sm text-text-muted">
          Answer YES/NO to help Coach evaluate your readiness and tailor today's training.
        </Text>
        {isDailyCheckinCompleted(checkin) ? (
          <Text className="mt-2 text-xs text-brand">Already completed — you can edit answers.</Text>
        ) : null}

        <View className="mt-6 gap-6">
          {checkin.questions.map((q) => {
            const currentAnswer = answers[q.id];
            return (
              <View
                key={q.id}
                className="rounded-xl border border-border bg-card/40 p-4"
              >
                <Text className="text-base leading-6 text-text-body">{q.text}</Text>
                <View className="mt-4 flex-row gap-3">
                  <Pressable
                    onPress={() => onAnswer(q.id, 'YES')}
                    className={`flex-1 items-center justify-center py-2.5 rounded-lg border ${
                      currentAnswer === 'YES'
                        ? 'border-brand bg-brand/10'
                        : 'border-border bg-card/60'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        currentAnswer === 'YES' ? 'text-brand' : 'text-text-muted'
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
                        : 'border-border bg-card/60'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        currentAnswer === 'NO' ? 'text-red-400' : 'text-text-muted'
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
          <Text className="text-xs uppercase tracking-wide text-text-muted mb-2">
            Notes for Coach (Optional)
          </Text>
          <TextInput
            className="w-full min-h-[80px] rounded-lg border border-border bg-card/40 px-3 py-2 text-base text-text-primary"
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
          disabled={!allAnswered}
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
      <View ref={containerRef} className="flex-1 bg-surface">
        {renderContent()}
      </View>
    </>
  );
}
