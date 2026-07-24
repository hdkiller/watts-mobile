/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app
 * pre-emit critique: P5 H4 E4 S4 R5 V4 — week first; season secondary; stats as metadata
 */
import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { AppSymbol } from '@/src/components/AppSymbol';
import { Button } from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import { StructureProfile } from '@/src/features/activity/charts/StructureProfile';
import { formatDuration } from '@/src/features/activity/mapActivity';
import type { PlannedListItem } from '@/src/features/activity/types';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';
import { localDateKey } from '@/src/features/today/weekGlance';

import {
  formatDayChipLabel,
  formatWeekRangeLabel,
  humanizePlanStrategy,
} from './formatPlanCopy';
import { filterPlannedToWeek, seasonTodayPercent, weekDateKeys } from './mapActivePlan';
import { OpenWebLink } from './OpenWebLink';
import { SeasonTimeline, WeekTargetStats } from './SeasonTimeline';
import type { ActivePlanShell, PlanWeekShell } from './types';
import {
  useAbandonPlanMutation,
  useAdaptPlanMutation,
  useGenerateAiWeekMutation,
  useGenerateBlockMutation,
  useGenerateStructureMutation,
  useMovePlannedMutation,
  usePatchWeekMutation,
  usePlanWeekSessionsQuery,
  useReplanStructureMutation,
} from './usePlans';

type Props = {
  shell: ActivePlanShell | null;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  hasUsableData?: boolean;
};

export function PlanTrainingSegment({
  shell,
  loading,
  error,
  onRetry,
  hasUsableData,
}: Props) {
  const { instanceUrl } = useAuth();
  const theme = useThemeColors();
  const weeks = shell?.weeks ?? [];
  const [weekIndex, setWeekIndex] = useState(0);

  useEffect(() => {
    if (!shell) return;
    const idx = shell.weeks.findIndex((w) => w.id === shell.currentWeek?.id);
    setWeekIndex(idx >= 0 ? idx : Math.max(0, shell.weeks.length - 1));
  }, [shell?.id, shell?.currentWeek?.id, shell?.weeks.length]);

  const weekMeta: PlanWeekShell | null = weeks[weekIndex] ?? shell?.currentWeek ?? null;
  const weekSessionsQuery = usePlanWeekSessionsQuery(
    weekMeta?.startDateKey,
    weekMeta?.endDateKey
  );
  const adapt = useAdaptPlanMutation();
  const abandon = useAbandonPlanMutation();
  const replan = useReplanStructureMutation();
  const patchWeek = usePatchWeekMutation();
  const movePlanned = useMovePlannedMutation();
  const genStructure = useGenerateStructureMutation();
  const genWeek = useGenerateAiWeekMutation();
  const genBlock = useGenerateBlockMutation();

  const [busyMsg, setBusyMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [weekTuneOpen, setWeekTuneOpen] = useState(false);
  const [aiWeekOpen, setAiWeekOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [moveTarget, setMoveTarget] = useState<PlannedListItem | null>(null);
  const [moveDate, setMoveDate] = useState('');

  const weekSessions = useMemo(() => {
    const items = weekSessionsQuery.data ?? [];
    return filterPlannedToWeek(items, weekMeta);
  }, [weekSessionsQuery.data, weekMeta]);

  const todayKey = localDateKey(new Date()) ?? '';
  const weekContainsToday = Boolean(
    weekMeta?.startDateKey &&
      todayKey >= weekMeta.startDateKey &&
      todayKey <= (weekMeta.endDateKey ?? weekMeta.startDateKey)
  );
  const weekIsPast = Boolean(
    weekMeta?.endDateKey && weekMeta.endDateKey < todayKey && !weekContainsToday
  );

  const [volumeMins, setVolumeMins] = useState('');
  const [tss, setTss] = useState('');
  const [focusLabel, setFocusLabel] = useState('');
  const [isRecovery, setIsRecovery] = useState(false);

  const moveDayKeys = useMemo(() => {
    const weekKeys = weekDateKeys(weekMeta);
    if (weekKeys.length > 0) return weekKeys;
    return [todayKey].filter(Boolean);
  }, [weekMeta, todayKey]);

  const openWeekTune = () => {
    if (!weekMeta) return;
    setVolumeMins(
      weekMeta.volumeTargetMinutes != null ? String(weekMeta.volumeTargetMinutes) : ''
    );
    setTss(weekMeta.tssTarget != null ? String(weekMeta.tssTarget) : '');
    setFocusLabel(weekMeta.focusLabel ?? '');
    setIsRecovery(weekMeta.isRecovery);
    setWeekTuneOpen(true);
  };

  const runBusy = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setBusyMsg(label);
    try {
      await fn();
      hapticSuccess();
    } catch (err) {
      hapticError();
      setActionError(friendlyError(err, 'Something went wrong'));
    } finally {
      setBusyMsg(null);
    }
  };

  if (loading && !shell) {
    return <PlanTrainingSkeleton />;
  }

  if (error && !shell) {
    return (
      <View className="gap-3 px-6 pt-4">
        <View className="rounded-xl border border-danger/40 bg-tint-error p-4">
          <Text className="text-base text-danger">
            {friendlyError(error, 'Failed to load plan')}
          </Text>
          <Pressable className="mt-3" hitSlop={8} onPress={onRetry}>
            <Text className="text-sm font-semibold text-brand">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!shell) {
    return (
      <View testID="plan-training-empty" className="gap-4 px-6 pt-6">
        <Text className="text-2xl font-semibold text-text-primary">No active plan</Text>
        <Text className="text-sm text-text-muted">
          Create a training plan to see your season, this week’s sessions, and adjust when life
          blows up.
        </Text>
        <Button
          label="Create plan"
          onPress={() => router.push(APP_HREFS.planCreate as Href)}
          testID="plan-create-cta"
        />
        <OpenWebLink
          label="Open on web"
          onPress={() => void openInstanceWeb(instanceUrl, '/plan')}
        />
      </View>
    );
  }

  const strategyLabel = humanizePlanStrategy(shell.strategy);
  const weekRange = formatWeekRangeLabel(weekMeta?.startDateKey, weekMeta?.endDateKey);
  const selectedBlock =
    shell.blocks.find((b) => b.id === weekMeta?.blockId) ?? shell.blocks[0] ?? null;
  const todayPct = seasonTodayPercent(shell.blocks, weeks, todayKey);

  const selectBlock = (blockId: string) => {
    const idx = weeks.findIndex((w) => w.blockId === blockId);
    if (idx >= 0) setWeekIndex(idx);
  };

  const confirmAdapt = (title: string, message: string, adaptationType: 'RECALCULATE_WEEK' | 'PUSH_FORWARD', busy: string) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: title.includes('Push') ? 'Push forward' : 'Recalculate',
        onPress: () =>
          void runBusy(busy, () => adapt.mutateAsync({ planId: shell.id, adaptationType })),
      },
    ]);
  };

  const showThisWeekMenu = () => {
    Alert.alert('This week', undefined, [
      { text: 'Tune this week', onPress: openWeekTune },
      { text: 'Generate week', onPress: () => setAiWeekOpen(true) },
      {
        text: 'Generate phase workouts',
        onPress: () => {
          const blockId = weekMeta?.blockId;
          if (!blockId) return;
          void runBusy('Generating phase workouts', () => genBlock.mutateAsync(blockId));
        },
      },
      {
        text: 'Recalculate remaining week',
        onPress: () =>
          confirmAdapt(
            'Recalculate remaining week?',
            'Upcoming sessions this week may be replaced.',
            'RECALCULATE_WEEK',
            'Recalculating week'
          ),
      },
      {
        text: 'Push schedule forward 1 day',
        onPress: () =>
          confirmAdapt(
            'Push schedule forward?',
            'Planned sessions move one day later.',
            'PUSH_FORWARD',
            'Pushing schedule'
          ),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const showSeasonMenu = () => {
    Alert.alert('Season', undefined, [
      {
        text: 'Edit blocks',
        onPress: () => router.push(APP_HREFS.planBlocks as Href),
      },
      {
        text: 'Replan structure',
        onPress: () => {
          Alert.alert(
            'Replan structure?',
            'Phase structure will be sent to the server as currently listed.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Replan',
                onPress: () => {
                  const blocks = shell.blocks.map((b, i) => ({
                    id: b.id,
                    name: b.name,
                    type: b.type,
                    primaryFocus: b.primaryFocus ?? b.name,
                    durationWeeks: b.durationWeeks,
                    order: b.order ?? i,
                  }));
                  void runBusy('Replanning structure', () =>
                    replan.mutateAsync({ planId: shell.id, blocks })
                  );
                },
              },
            ]
          );
        },
      },
      {
        text: 'Start new plan',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Start new plan?',
            'This abandons the current plan and opens the generator.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Abandon & create',
                style: 'destructive',
                onPress: () =>
                  void runBusy('Abandoning plan', async () => {
                    await abandon.mutateAsync(shell.id);
                    router.push(APP_HREFS.planCreate as Href);
                  }),
              },
            ]
          );
        },
      },
      {
        text: 'Abandon plan',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Abandon plan?', 'Future AI workouts will be cleared.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Abandon',
              style: 'destructive',
              onPress: () =>
                void runBusy('Abandoning plan', () => abandon.mutateAsync(shell.id)),
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const showAdjustMenu = () => {
    if (busyMsg) return;
    hapticLight();
    Alert.alert('Adjust plan', undefined, [
      { text: 'This week…', onPress: showThisWeekMenu },
      { text: 'Season…', onPress: showSeasonMenu },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View testID="plan-training" className="gap-5 px-6 pb-10 pt-4">
      {busyMsg ? (
        <Text className="text-sm text-brand" testID="plan-busy">
          {busyMsg}…
        </Text>
      ) : null}
      {actionError ? (
        <View className="rounded-xl border border-danger/40 bg-tint-error p-3">
          <Text className="text-sm text-danger">{actionError}</Text>
        </View>
      ) : null}

      <View className="gap-1">
        <Text className="text-2xl font-semibold text-text-primary" testID="plan-title">
          {shell.title}
        </Text>
        {shell.currentPhaseLabel || strategyLabel ? (
          <Text className="text-sm text-text-muted">
            {[shell.currentPhaseLabel, strategyLabel].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
        {shell.provisionalHint || hasUsableData === false ? (
          <Text className="mt-1 text-sm text-modify">
            Provisional — coaching improves after Health Sync or a connected app.
          </Text>
        ) : null}
        {weekIsPast ? (
          <Text className="mt-1 text-sm text-modify">
            Showing a past plan week — browse weeks or start a new plan when you’re ready.
          </Text>
        ) : null}
      </View>

      <View>
        {weeks.length > 1 ? (
          <View className="mb-3 flex-row items-center justify-between">
            <AnimatedPressable
              hitSlop={8}
              disabled={weekIndex <= 0}
              onPress={() => {
                hapticLight();
                setWeekIndex((i) => Math.max(0, i - 1));
              }}
              accessibilityRole="button"
              accessibilityLabel="Previous week"
            >
              <Text
                className={`text-sm font-semibold ${
                  weekIndex <= 0 ? 'text-text-muted' : 'text-brand'
                }`}
              >
                Previous
              </Text>
            </AnimatedPressable>
            <Text className="text-sm font-semibold text-text-primary">
              {weekRange ?? 'Week'}
            </Text>
            <AnimatedPressable
              hitSlop={8}
              disabled={weekIndex >= weeks.length - 1}
              onPress={() => {
                hapticLight();
                setWeekIndex((i) => Math.min(weeks.length - 1, i + 1));
              }}
              accessibilityRole="button"
              accessibilityLabel="Next week"
            >
              <Text
                className={`text-sm font-semibold ${
                  weekIndex >= weeks.length - 1 ? 'text-text-muted' : 'text-brand'
                }`}
              >
                Next
              </Text>
            </AnimatedPressable>
          </View>
        ) : null}

        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
          {weekContainsToday ? 'This week' : 'Plan week'}
          {weekRange && weeks.length <= 1 ? ` · ${weekRange}` : ''}
        </Text>

        <View className="mb-3">
          <WeekTargetStats week={weekMeta} block={selectedBlock} />
        </View>

        {weekMeta?.explanation ? (
          <Text className="mb-3 text-sm text-text-body">{weekMeta.explanation}</Text>
        ) : null}

        {weekSessionsQuery.isLoading && weekSessions.length === 0 ? (
          <View className="gap-2" testID="plan-week-sessions-skeleton">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </View>
        ) : weekSessions.length === 0 ? (
          <Text className="text-sm text-text-muted">
            No sessions in this week yet. Use Adjust plan → This week → Generate week, or browse
            Upcoming.
          </Text>
        ) : (
          weekSessions.map((item) => (
            <SessionRow
              key={item.id}
              item={item}
              busy={Boolean(busyMsg)}
              onOpen={() => {
                hapticLight();
                router.push(APP_HREFS.plannedDetail(item.id) as Href);
              }}
              onMove={() => {
                hapticLight();
                setMoveTarget(item);
                setMoveDate(localDateKey(item.date) ?? moveDayKeys[0] ?? '');
              }}
              onGenerateStructure={
                !item.structureChartBlocks || item.structureChartBlocks.length < 2
                  ? () =>
                      void runBusy('Generating structure', () =>
                        genStructure.mutateAsync(item.id)
                      )
                  : undefined
              }
            />
          ))
        )}
      </View>

      <Button
        label="Adjust plan"
        variant="secondary"
        onPress={showAdjustMenu}
        disabled={Boolean(busyMsg)}
        testID="plan-adjust"
      />

      {shell.blocks.length > 0 ? (
        <SeasonTimeline
          blocks={shell.blocks}
          selectedBlockId={weekMeta?.blockId ?? selectedBlock?.id ?? null}
          todayPercent={todayPct}
          onSelectBlock={selectBlock}
        />
      ) : null}

      {shell.coachNotes ? (
        <Text className="text-sm text-text-body">{shell.coachNotes}</Text>
      ) : null}

      <OpenWebLink
        label="Open on web"
        onPress={() => void openInstanceWeb(instanceUrl, '/plan')}
      />

      <SheetModal visible={weekTuneOpen} onClose={() => setWeekTuneOpen(false)}>
        <Text className="mb-3 text-lg font-semibold text-text-primary">Tune week</Text>
        <Field label="Focus" value={focusLabel} onChangeText={setFocusLabel} />
        <Field
          label="Volume (minutes)"
          value={volumeMins}
          onChangeText={setVolumeMins}
          keyboardType="number-pad"
        />
        <Field label="TSS target" value={tss} onChangeText={setTss} keyboardType="number-pad" />
        <AnimatedPressable
          className="mb-4 flex-row items-center gap-2"
          hitSlop={8}
          onPress={() => {
            hapticLight();
            setIsRecovery((v) => !v);
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isRecovery }}
          accessibilityLabel="Recovery week"
        >
          <View
            className={`h-5 w-5 items-center justify-center rounded border ${
              isRecovery ? 'border-brand bg-brand' : 'border-border-strong'
            }`}
          >
            {isRecovery ? (
              <AppSymbol sf="checkmark" size={12} tintColor={theme.ink} fallback="" />
            ) : null}
          </View>
          <Text className="text-sm text-text-primary">Recovery week</Text>
        </AnimatedPressable>
        <Button
          label="Save"
          disabled={Boolean(busyMsg)}
          onPress={() => {
            if (!weekMeta) return;
            void runBusy('Saving week', async () => {
              await patchWeek.mutateAsync({
                weekId: weekMeta.id,
                input: {
                  focusLabel: focusLabel.trim() || undefined,
                  volumeTargetMinutes: volumeMins ? Number(volumeMins) : undefined,
                  tssTarget: tss ? Number(tss) : undefined,
                  isRecovery,
                },
              });
              setWeekTuneOpen(false);
            });
          }}
        />
        <View className="mt-3">
          <Button label="Cancel" variant="secondary" onPress={() => setWeekTuneOpen(false)} />
        </View>
      </SheetModal>

      <SheetModal visible={aiWeekOpen} onClose={() => setAiWeekOpen(false)}>
        <Text className="mb-3 text-lg font-semibold text-text-primary">Generate week</Text>
        <Text className="mb-2 text-sm text-text-muted">
          Optional instructions for this week’s workouts.
        </Text>
        <TextInput
          className="mb-4 min-h-[80px] rounded-xl border border-border-strong bg-card px-3 py-2 text-text-primary"
          multiline
          value={aiInstructions}
          onChangeText={setAiInstructions}
          placeholder="e.g. Keep Tuesday easy, race Saturday"
          placeholderTextColor={theme.textMuted}
        />
        <Button
          label="Generate"
          disabled={Boolean(busyMsg)}
          onPress={() => {
            if (!weekMeta) return;
            void runBusy('Generating week', async () => {
              await genWeek.mutateAsync({
                blockId: weekMeta.blockId,
                weekId: weekMeta.id,
                instructions: aiInstructions,
              });
              setAiWeekOpen(false);
              setAiInstructions('');
            });
          }}
        />
        <View className="mt-3">
          <Button label="Cancel" variant="secondary" onPress={() => setAiWeekOpen(false)} />
        </View>
      </SheetModal>

      <SheetModal visible={Boolean(moveTarget)} onClose={() => setMoveTarget(null)}>
        <Text className="mb-3 text-lg font-semibold text-text-primary">Move workout</Text>
        <Text className="mb-3 text-sm text-text-muted">{moveTarget?.title}</Text>
        <Text className="mb-2 text-sm font-medium text-text-muted">New day</Text>
        <View className="mb-4 flex-row flex-wrap gap-2">
          {moveDayKeys.map((key) => {
            const selected = moveDate === key;
            return (
              <AnimatedPressable
                key={key}
                hitSlop={8}
                onPress={() => {
                  hapticLight();
                  setMoveDate(key);
                }}
                className={`rounded-xl border px-3 py-1.5 ${
                  selected ? 'border-brand bg-brand/15' : 'border-border bg-card'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    selected ? 'text-brand' : 'text-text-primary'
                  }`}
                >
                  {formatDayChipLabel(key)}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
        <Button
          label="Move"
          disabled={Boolean(busyMsg)}
          onPress={() => {
            if (!moveTarget || !moveDate) {
              setActionError('Pick a day');
              hapticError();
              return;
            }
            void runBusy('Moving workout', async () => {
              await movePlanned.mutateAsync({ id: moveTarget.id, date: moveDate });
              setMoveTarget(null);
            });
          }}
        />
        <View className="mt-3">
          <Button label="Cancel" variant="secondary" onPress={() => setMoveTarget(null)} />
        </View>
      </SheetModal>
    </View>
  );
}

function SheetModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/50"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable className="flex-1" onPress={onClose} accessibilityRole="button" />
        <View className="max-h-[85%] rounded-t-2xl bg-surface px-6 pb-10 pt-5">
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PlanTrainingSkeleton() {
  return (
    <View className="gap-4 px-6 pt-4" testID="plan-training-skeleton">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mt-2 h-11 w-full rounded-xl" />
      <Skeleton className="mt-2 h-3 w-1/3" />
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'number-pad';
}) {
  const theme = useThemeColors();
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm font-medium text-text-muted">{label}</Text>
      <TextInput
        className="rounded-xl border border-border-strong bg-card px-3 py-2.5 text-text-primary"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={theme.textMuted}
      />
    </View>
  );
}

function SessionRow({
  item,
  busy,
  onOpen,
  onMove,
  onGenerateStructure,
}: {
  item: PlannedListItem;
  busy: boolean;
  onOpen: () => void;
  onMove: () => void;
  onGenerateStructure?: () => void;
}) {
  const dayKey = localDateKey(item.date);
  const meta = [
    dayKey ? formatDayChipLabel(dayKey) : null,
    humanizeWorkoutType(item.type),
    formatDuration(item.durationSec),
    item.tss != null ? `TSS ${Math.round(item.tss)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const chartBlocks = item.structureChartBlocks;

  const showMore = () => {
    if (busy) return;
    hapticLight();
    const buttons: Array<{
      text: string;
      style?: 'cancel' | 'destructive';
      onPress?: () => void;
    }> = [
      { text: 'Move', onPress: onMove },
    ];
    if (onGenerateStructure) {
      buttons.push({ text: 'Generate structure', onPress: onGenerateStructure });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(item.title, undefined, buttons);
  };

  return (
    <View className="border-b border-border/80 py-3">
      <AnimatedPressable
        onPress={onOpen}
        hitSlop={8}
        className="flex-row items-center gap-3"
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        <SportIcon type={item.type} size={14} />
        <View className="min-w-0 flex-1">
          <Text className="text-base font-medium text-text-primary" numberOfLines={1}>
            {item.title}
          </Text>
          {meta ? <Text className="mt-1 text-sm text-text-muted">{meta}</Text> : null}
          {chartBlocks && chartBlocks.length >= 2 ? (
            <StructureProfile blocks={chartBlocks} compact />
          ) : null}
        </View>
      </AnimatedPressable>
      <AnimatedPressable
        hitSlop={8}
        onPress={showMore}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Session actions"
        className="mt-2 self-start"
      >
        <Text className="text-sm font-semibold text-brand">More</Text>
      </AnimatedPressable>
    </View>
  );
}
