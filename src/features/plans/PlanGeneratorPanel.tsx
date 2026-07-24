/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app
 * pre-emit critique: P5 H5 E5 S4 R5 V4 — days → volume → sports → approach (advanced collapsed)
 */
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Button } from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

import {
  activatePlan,
  generateFirstWeekPreview,
  initializePlan,
  saveAvailability,
} from './api';
import { formatDayChipLabel } from './formatPlanCopy';
import {
  buildAvailabilityDays,
  clampVolumeHours,
  PLAN_STRATEGY_OPTIONS,
  RECOVERY_RHYTHM_OPTIONS,
  STARTING_PHASE_OPTIONS,
  VOLUME_HOUR_CHIPS,
  volumePreferenceFromHours,
} from './planGeneratorHelpers';
import type {
  PlannedWorkoutPreview,
  PlanStrategy,
  StartingPhase,
} from './types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SPORTS = [
  { id: 'Ride', label: 'Ride' },
  { id: 'Run', label: 'Run' },
  { id: 'Swim', label: 'Swim' },
  { id: 'Gym', label: 'Strength' },
];

const FORM_STEPS = ['days', 'volume', 'sports', 'approach'] as const;
type FormStep = (typeof FORM_STEPS)[number];

type Props = {
  goalId: string | null | undefined;
  onActivated: (planId: string) => void | Promise<void>;
  onGenerateStart?: () => void;
};

function stepIndex(step: FormStep): number {
  return FORM_STEPS.indexOf(step) + 1;
}

function ChipRow<T extends string | number>({
  options,
  value,
  onChange,
  testIDPrefix,
}: {
  options: { id: T; label: string; hint?: string }[];
  value: T;
  onChange: (id: T) => void;
  testIDPrefix?: string;
}) {
  const selected = options.find((o) => o.id === value);
  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <AnimatedPressable
              key={String(opt.id)}
              testID={testIDPrefix ? `${testIDPrefix}-${opt.id}` : undefined}
              onPress={() => {
                hapticLight();
                onChange(opt.id);
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={opt.hint}
              className={`rounded-xl border px-3 py-2 ${
                isSelected ? 'border-brand bg-brand/15' : 'border-border bg-card/60'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected ? 'text-brand' : 'text-text-primary'
                }`}
              >
                {opt.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
      {selected?.hint ? (
        <Text className="mt-2 text-sm text-text-muted">{selected.hint}</Text>
      ) : null}
    </View>
  );
}

function StepMeta({ step, label }: { step: FormStep; label?: string }) {
  return (
    <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
      Step {stepIndex(step)} of {FORM_STEPS.length}
      {label ? ` · ${label}` : ''}
    </Text>
  );
}

function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <AnimatedPressable
      hitSlop={8}
      onPress={onPress}
      accessibilityRole="button"
      className="mb-1 self-start"
    >
      <Text className="text-sm font-semibold text-brand">{label}</Text>
    </AnimatedPressable>
  );
}

export function PlanGeneratorPanel({
  goalId,
  onActivated,
  onGenerateStart,
}: Props) {
  const theme = useThemeColors();
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [volumeHours, setVolumeHours] = useState(6);
  const [sports, setSports] = useState<string[]>(['Ride']);
  const [strategy, setStrategy] = useState<PlanStrategy>('LINEAR');
  const [recoveryRhythm, setRecoveryRhythm] = useState(4);
  const [startingPhase, setStartingPhase] = useState<StartingPhase>('BASE');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [phase, setPhase] = useState<'form' | 'working' | 'preview'>('form');
  const [formStep, setFormStep] = useState<FormStep>('days');
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

  const volumeBand =
    volumeHours <= 5 ? 'lighter load' : volumeHours >= 10 ? 'heavier load' : 'balanced load';

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
      const hours = clampVolumeHours(volumeHours);
      await saveAvailability(buildAvailabilityDays(days, sports));

      const startDate = new Date();
      startDate.setUTCHours(12, 0, 0, 0);
      const result = await initializePlan({
        goalId,
        startDate: startDate.toISOString(),
        volumeHours: hours,
        volumePreference: volumePreferenceFromHours(hours),
        preferredActivityTypes: sports,
        strategy,
        recoveryRhythm,
        startingPhase,
        ...(customInstructions.trim()
          ? { customInstructions: customInstructions.trim() }
          : {}),
      });
      setPlanId(result.planId);
      const week = await generateFirstWeekPreview(result);
      setPreview(week);
      setPhase('preview');
      hapticSuccess();
    } catch (err) {
      setPhase('form');
      setFormStep('approach');
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

      {phase === 'form' && formStep === 'days' ? (
        <>
          <StepMeta step="days" />
          <View>
            <Text className="mb-1 text-base font-semibold text-text-primary">Training days</Text>
            <Text className="mb-3 text-sm text-text-muted">Which days can you train?</Text>
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
          <Button
            label="Continue"
            onPress={() => {
              hapticLight();
              setFormStep('volume');
            }}
            disabled={days.length === 0}
            testID="plan-generator-continue"
          />
        </>
      ) : null}

      {phase === 'form' && formStep === 'volume' ? (
        <>
          <BackLink
            label="← Training days"
            onPress={() => {
              hapticLight();
              setFormStep('days');
            }}
          />
          <StepMeta step="volume" />
          <View>
            <Text className="mb-1 text-base font-semibold text-text-primary">Weekly volume</Text>
            <Text className="mb-3 text-sm text-text-muted">
              About {volumeHours} hours/week · {volumeBand}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {VOLUME_HOUR_CHIPS.map((h) => {
                const selected = volumeHours === h;
                return (
                  <AnimatedPressable
                    key={h}
                    onPress={() => {
                      hapticLight();
                      setVolumeHours(h);
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`rounded-xl border px-3 py-2 ${
                      selected ? 'border-brand bg-brand/15' : 'border-border bg-card/60'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-brand' : 'text-text-primary'
                      }`}
                    >
                      {h}h
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
          <Button
            label="Continue"
            onPress={() => {
              hapticLight();
              setFormStep('sports');
            }}
            testID="plan-generator-continue-sports"
          />
        </>
      ) : null}

      {phase === 'form' && formStep === 'sports' ? (
        <>
          <BackLink
            label="← Weekly volume"
            onPress={() => {
              hapticLight();
              setFormStep('volume');
            }}
          />
          <StepMeta step="sports" />
          <View>
            <Text className="mb-1 text-base font-semibold text-text-primary">Sports</Text>
            <Text className="mb-3 text-sm text-text-muted">What should this plan train?</Text>
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
            label="Continue"
            onPress={() => {
              hapticLight();
              setShowAdvanced(false);
              setFormStep('approach');
            }}
            disabled={sports.length === 0}
            testID="plan-generator-continue-approach"
          />
        </>
      ) : null}

      {phase === 'form' && formStep === 'approach' ? (
        <>
          <BackLink
            label="← Sports"
            onPress={() => {
              hapticLight();
              setFormStep('sports');
            }}
          />
          <StepMeta step="approach" />
          <View>
            <Text className="mb-1 text-base font-semibold text-text-primary">Starting point</Text>
            <Text className="mb-3 text-sm text-text-muted">
              How ready are you as the season begins?
            </Text>
            <ChipRow
              options={STARTING_PHASE_OPTIONS}
              value={startingPhase}
              onChange={setStartingPhase}
              testIDPrefix="plan-phase"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium text-text-muted">
              Anything else? (optional)
            </Text>
            <TextInput
              className="min-h-[72px] rounded-xl border border-border-strong bg-card px-3 py-2 text-text-primary"
              multiline
              value={customInstructions}
              onChangeText={setCustomInstructions}
              placeholder="e.g. Keep Tuesdays easy, race in October"
              placeholderTextColor={theme.textMuted}
              testID="plan-generator-instructions"
            />
          </View>

          <AnimatedPressable
            hitSlop={8}
            onPress={() => {
              hapticLight();
              setShowAdvanced((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityState={{ expanded: showAdvanced }}
            accessibilityLabel={showAdvanced ? 'Hide more options' : 'Show more options'}
            className="self-start py-1"
            testID="plan-generator-more-options"
          >
            <Text className="text-sm font-semibold text-brand">
              {showAdvanced ? 'Hide more options' : 'More options'}
            </Text>
          </AnimatedPressable>

          {showAdvanced ? (
            <View className="gap-4">
              <View>
                <Text className="mb-2 text-sm font-medium text-text-muted">Strategy</Text>
                <ChipRow
                  options={PLAN_STRATEGY_OPTIONS}
                  value={strategy}
                  onChange={setStrategy}
                  testIDPrefix="plan-strategy"
                />
              </View>
              <View>
                <Text className="mb-2 text-sm font-medium text-text-muted">Recovery cycle</Text>
                <ChipRow
                  options={RECOVERY_RHYTHM_OPTIONS}
                  value={recoveryRhythm}
                  onChange={setRecoveryRhythm}
                  testIDPrefix="plan-recovery"
                />
              </View>
            </View>
          ) : null}

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
          {preview.length === 0 ? (
            <Text className="text-sm text-text-muted">
              No sessions in the preview yet. You can still activate and generate weeks on Plan.
            </Text>
          ) : (
            preview.map((w, i) => {
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
            })
          )}
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
            onPress={() => {
              setPhase('form');
              setFormStep('approach');
            }}
            disabled={busy}
          />
        </View>
      ) : null}
    </View>
  );
}
