import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { trackActivationEvent } from '@/src/features/activation/analytics';
import { useActivationStatus, useAdvanceActivationStatus } from '@/src/features/activation/useActivationStatus';
import {
  activatePlan,
  generateFirstWeekPreview,
  initializePlan,
  saveAvailability,
  type AvailabilityDay,
} from '@/src/features/plans/api';
import type { PlannedWorkoutPreview, VolumePreference } from '@/src/features/plans/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const VOLUMES: { id: VolumePreference; label: string }[] = [
  { id: 'LOW', label: 'Low' },
  { id: 'MID', label: 'Medium' },
  { id: 'HIGH', label: 'High' },
];
const SPORTS = [
  { id: 'Ride', label: 'Ride' },
  { id: 'Run', label: 'Run' },
  { id: 'Swim', label: 'Swim' },
];

export default function ActivationPlanScreen() {
  const router = useRouter();
  const { instanceUrl } = useAuth();
  const { data: activation } = useActivationStatus();
  const advance = useAdvanceActivationStatus();

  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [volume, setVolume] = useState<VolumePreference>('MID');
  const [sports, setSports] = useState<string[]>(['Ride']);
  const [phase, setPhase] = useState<'form' | 'working' | 'preview'>('form');
  const [planId, setPlanId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PlannedWorkoutPreview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goalId = activation?.primaryGoalId;

  const toggleDay = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };
  const toggleSport = (id: string) => {
    setSports((prev) => {
      if (prev.includes(id)) return prev.length === 1 ? prev : prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const canGenerate = useMemo(
    () => Boolean(goalId) && days.length > 0 && sports.length > 0,
    [goalId, days.length, sports.length]
  );

  const onGenerate = async () => {
    if (!goalId) {
      setError('Create a goal first, then return here.');
      return;
    }
    setError(null);
    setBusy(true);
    setPhase('working');
    try {
      const availability: AvailabilityDay[] = days.map((dayOfWeek) => ({
        dayOfWeek,
        morning: false,
        afternoon: true,
        evening: false,
      }));
      await saveAvailability(availability);

      const startDate = new Date();
      startDate.setUTCHours(12, 0, 0, 0);
      const result = await initializePlan({
        goalId,
        startDate: startDate.toISOString(),
        volumePreference: volume,
        preferredActivityTypes: sports,
      });
      setPlanId(result.planId);
      const week = await generateFirstWeekPreview(result);
      setPreview(week);
      setPhase('preview');
    } catch (err) {
      setPhase('form');
      setError(friendlyError(err, 'Could not generate plan'));
    } finally {
      setBusy(false);
    }
  };

  const onActivate = async () => {
    if (!planId) return;
    setError(null);
    setBusy(true);
    try {
      await activatePlan(planId);
      trackActivationEvent('activation_plan_activated');
      await advance({ mobileActivationStep: 'insight', activePlanId: planId });
      router.replace('/(activation)/insight');
    } catch (err) {
      setError(friendlyError(err, 'Could not activate plan'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-6 pb-10 pt-2">
        <Text className="text-2xl font-semibold text-text-primary">Build a starter plan</Text>
        <Text className="mt-2 text-base text-text-muted">
          Tell us when you can train. We’ll generate a draft week you can activate — deep edits stay on
          web.
        </Text>

        {phase === 'working' ? (
          <View className="mt-12 items-center gap-3">
            <ActivityIndicator />
            <Text className="text-center text-base text-text-muted">
              Generating your plan and first training week…
            </Text>
            <Button
              className="mt-4 w-full"
              variant="secondary"
              label="Open plan tools on web"
              onPress={() => void openInstanceWeb(instanceUrl, '/plans')}
            />
          </View>
        ) : null}

        {phase === 'form' ? (
          <>
            <Text className="mt-6 text-sm font-medium text-text-muted">Training days</Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {DAY_LABELS.map((label, index) => {
                const selected = days.includes(index);
                return (
                  <Pressable
                    key={label}
                    onPress={() => toggleDay(index)}
                    className={`rounded-lg px-3 py-2 ${selected ? 'bg-brand-action' : 'border border-border bg-card'}`}
                  >
                    <Text className={selected ? 'text-sm font-medium text-ink' : 'text-sm text-text-primary'}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mt-6 text-sm font-medium text-text-muted">Weekly volume</Text>
            <View className="mt-2 flex-row gap-2">
              {VOLUMES.map((item) => {
                const selected = volume === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setVolume(item.id)}
                    className={`flex-1 items-center rounded-lg py-3 ${selected ? 'bg-brand-action' : 'border border-border bg-card'}`}
                  >
                    <Text className={selected ? 'font-medium text-ink' : 'text-text-primary'}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mt-6 text-sm font-medium text-text-muted">Sports</Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {SPORTS.map((item) => {
                const selected = sports.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleSport(item.id)}
                    className={`rounded-lg px-3 py-2 ${selected ? 'bg-brand-action' : 'border border-border bg-card'}`}
                  >
                    <Text className={selected ? 'text-sm font-medium text-ink' : 'text-sm text-text-primary'}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

            <Button
              className="mt-8"
              label="Generate plan"
              disabled={!canGenerate}
              loading={busy}
              onPress={() => void onGenerate()}
            />

            <Button
              className="mt-3"
              variant="secondary"
              label="Open plan tools on web"
              onPress={() => void openInstanceWeb(instanceUrl, '/plans')}
            />
          </>
        ) : null}

        {phase === 'preview' ? (
          <>
            <Text className="mt-6 text-lg font-semibold text-text-primary">First week preview</Text>
            <Text className="mt-1 text-sm text-text-muted">
              Provisional until you connect health or a wearable — you can still activate now.
            </Text>
            <View className="mt-4 gap-2">
              {preview.map((w, i) => (
                  <View key={w.id ?? `${w.title}-${i}`} className="rounded-xl border border-border bg-card p-3">
                    <Text className="text-base text-text-primary">{w.title || w.type || 'Session'}</Text>
                    {w.date ? <Text className="mt-1 text-sm text-text-muted">{w.date}</Text> : null}
                    {w.duration ? (
                      <Text className="mt-1 text-sm text-text-muted">{w.duration} min</Text>
                    ) : null}
                  </View>
                ))}
            </View>

            {error ? <Text className="mt-4 text-sm text-red-400">{error}</Text> : null}

            <Button className="mt-8" label="Activate plan" loading={busy} onPress={() => void onActivate()} />
            <Button
              className="mt-3"
              variant="secondary"
              label="Back"
              onPress={() => {
                setPhase('form');
                setError(null);
              }}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
