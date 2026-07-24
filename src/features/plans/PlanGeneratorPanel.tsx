/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Button } from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';

import {
  activatePlan,
  generateFirstWeekPreview,
  initializePlan,
  saveAvailability,
  type AvailabilityDay,
} from './api';
import { formatDayChipLabel } from './formatPlanCopy';
import { OpenWebLink } from './OpenWebLink';
import type { PlannedWorkoutPreview, VolumePreference } from './types';

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

type Props = {
  goalId: string | null | undefined;
  onActivated: (planId: string) => void | Promise<void>;
  onGenerateStart?: () => void;
  showOpenWeb?: boolean;
};

export function PlanGeneratorPanel({
  goalId,
  onActivated,
  onGenerateStart,
  showOpenWeb = true,
}: Props) {
  const { instanceUrl } = useAuth();
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [volume, setVolume] = useState<VolumePreference>('MID');
  const [sports, setSports] = useState<string[]>(['Ride']);
  const [phase, setPhase] = useState<'form' | 'working' | 'preview'>('form');
  const [planId, setPlanId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PlannedWorkoutPreview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (d: number) => {
    hapticLight();
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };
  const toggleSport = (id: string) => {
    hapticLight();
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
      hapticError();
      return;
    }
    setError(null);
    setBusy(true);
    setPhase('working');
    onGenerateStart?.();
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
      hapticSuccess();
    } catch (err) {
      setPhase('form');
      setError(friendlyError(err, 'Could not generate plan'));
      hapticError();
    } finally {
      setBusy(false);
    }
  };

  const onActivate = async () => {
    if (!planId) return;
    setBusy(true);
    setError(null);
    try {
      await activatePlan(planId);
      hapticSuccess();
      await onActivated(planId);
    } catch (err) {
      setError(friendlyError(err, 'Could not activate plan'));
      hapticError();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View testID="plan-generator" className="gap-4">
      {error ? (
        <View className="rounded-xl border border-danger/40 bg-tint-error p-3">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      ) : null}

      {!goalId ? (
        <Text className="text-sm text-text-muted">
          You need a primary goal before generating a plan. Create one under More → Goals.
        </Text>
      ) : null}

      {phase === 'working' ? (
        <View className="gap-3 py-2">
          <Text className="text-sm text-text-muted">Generating your first week…</Text>
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </View>
      ) : null}

      {phase === 'form' ? (
        <>
          <View>
            <Text className="mb-2 text-sm font-medium text-text-muted">Training days</Text>
            <View className="flex-row flex-wrap gap-2">
              {DAY_LABELS.map((label, index) => {
                const selected = days.includes(index);
                return (
                  <AnimatedPressable
                    key={label}
                    onPress={() => toggleDay(index)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`rounded-xl border px-3 py-1.5 ${
                      selected ? 'border-brand bg-brand/15' : 'border-border bg-card/60'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selected ? 'text-brand' : 'text-text-muted'
                      }`}
                    >
                      {label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-text-muted">Weekly volume</Text>
            <View className="flex-row gap-2">
              {VOLUMES.map((v) => {
                const selected = volume === v.id;
                return (
                  <AnimatedPressable
                    key={v.id}
                    onPress={() => {
                      hapticLight();
                      setVolume(v.id);
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`flex-1 rounded-xl border px-3 py-2.5 ${
                      selected ? 'border-brand bg-brand/15' : 'border-border bg-card/60'
                    }`}
                  >
                    <Text
                      className={`text-center text-sm font-semibold ${
                        selected ? 'text-brand' : 'text-text-primary'
                      }`}
                    >
                      {v.label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-text-muted">Sports</Text>
            <View className="flex-row flex-wrap gap-2">
              {SPORTS.map((s) => {
                const selected = sports.includes(s.id);
                return (
                  <AnimatedPressable
                    key={s.id}
                    onPress={() => toggleSport(s.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`rounded-xl border px-3 py-1.5 ${
                      selected ? 'border-brand bg-brand/15' : 'border-border bg-card/60'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selected ? 'text-brand' : 'text-text-muted'
                      }`}
                    >
                      {s.label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          <Button
            label="Generate plan"
            onPress={() => void onGenerate()}
            loading={busy}
            disabled={!canGenerate || busy}
            testID="plan-generator-generate"
          />
        </>
      ) : null}

      {phase === 'preview' ? (
        <View className="gap-3">
          <Text className="text-base font-semibold text-text-primary">First week preview</Text>
          <Text className="text-sm text-text-muted">
            Review these sessions, then activate. The plan may improve after you connect data.
          </Text>
          {preview.map((w, i) => {
            const dateKey = w.date?.slice?.(0, 10);
            return (
              <View
                key={w.id ?? `${w.title}-${i}`}
                className="rounded-xl border border-border bg-card/70 px-3 py-2.5"
              >
                <Text className="text-sm font-semibold text-text-primary">
                  {w.title || 'Workout'}
                </Text>
                <Text className="mt-0.5 text-xs text-text-muted">
                  {[
                    w.type,
                    dateKey ? formatDayChipLabel(dateKey) : null,
                    w.duration != null ? `${w.duration} min` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            );
          })}
          <Button
            label="Activate plan"
            onPress={() => void onActivate()}
            loading={busy}
            disabled={busy}
            testID="plan-generator-activate"
          />
          <Button
            label="Back to edit"
            variant="secondary"
            onPress={() => setPhase('form')}
            disabled={busy}
          />
        </View>
      ) : null}

      {showOpenWeb ? (
        <OpenWebLink
          label="Open on web"
          onPress={() => void openInstanceWeb(instanceUrl, '/plan')}
        />
      ) : null}
    </View>
  );
}
