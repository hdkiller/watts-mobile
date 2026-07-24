/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { router, Stack, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { showActionSheet } from '@/src/components/ActionSheet';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { BottomSheet } from '@/src/components/BottomSheet';
import { Button } from '@/src/components/Button';
import { ListSkeleton } from '@/src/components/Skeleton';
import { humanizeBlockType } from '@/src/features/plans/formatPlanCopy';
import { useActivePlanQuery, useBlockMutations } from '@/src/features/plans/usePlans';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';

const BLOCK_TYPES = [
  { id: 'BASE', label: 'Base' },
  { id: 'BUILD', label: 'Build' },
  { id: 'PEAK', label: 'Peak' },
  { id: 'RACE', label: 'Race' },
  { id: 'TRANSITION', label: 'Transition' },
] as const;

export default function PlanBlocksScreen() {
  const theme = useThemeColors();
  const plan = useActivePlanQuery();
  const shell = plan.data?.shell;
  const { create, patch, remove, reorder } = useBlockMutations();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('BUILD');
  const [weeks, setWeeks] = useState('3');
  const [busy, setBusy] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const blocks = shell?.blocks ?? [];

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    setBusy(true);
    try {
      await fn();
      hapticSuccess();
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not update blocks'));
    } finally {
      setBusy(false);
    }
  };

  const openBlockActions = (index: number) => {
    if (!shell || busy) return;
    const b = blocks[index];
    if (!b) return;
    hapticLight();

    const options = [
      {
        label: 'Rename',
        onPress: () => {
          setRenameTarget({ id: b.id, name: b.name });
          setRenameValue(b.name);
        },
      },
      ...(index > 0
        ? [
            {
              label: 'Move up',
              onPress: () => {
                const next = [...blocks];
                const tmp = next[index - 1]!;
                next[index - 1] = next[index]!;
                next[index] = tmp;
                void run(() =>
                  reorder.mutateAsync({
                    planId: shell.id,
                    blocks: next.map((x, i) => ({ id: x.id, order: i })),
                  })
                );
              },
            },
          ]
        : []),
      ...(index < blocks.length - 1
        ? [
            {
              label: 'Move down',
              onPress: () => {
                const next = [...blocks];
                const tmp = next[index + 1]!;
                next[index + 1] = next[index]!;
                next[index] = tmp;
                void run(() =>
                  reorder.mutateAsync({
                    planId: shell.id,
                    blocks: next.map((x, i) => ({ id: x.id, order: i })),
                  })
                );
              },
            },
          ]
        : []),
      {
        label: '+1 week',
        onPress: () =>
          void run(() =>
            patch.mutateAsync({
              planId: shell.id,
              blockId: b.id,
              input: { durationWeeks: b.durationWeeks + 1 },
            })
          ),
      },
      ...(b.durationWeeks > 1
        ? [
            {
              label: '−1 week',
              onPress: () =>
                void run(() =>
                  patch.mutateAsync({
                    planId: shell.id,
                    blockId: b.id,
                    input: { durationWeeks: Math.max(1, b.durationWeeks - 1) },
                  })
                ),
            },
          ]
        : []),
      ...(blocks.length > 1
        ? [
            {
              label: 'Delete',
              style: 'destructive' as const,
              onPress: () => {
                Alert.alert('Delete block?', b.name, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () =>
                      void run(() =>
                        remove.mutateAsync({ planId: shell.id, blockId: b.id })
                      ),
                  },
                ]);
              },
            },
          ]
        : []),
      { label: 'Cancel', style: 'cancel' as const },
    ];

    showActionSheet({ title: b.name, options });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Edit blocks', headerShown: true }} />
      {plan.isLoading && !shell ? (
        <ListSkeleton rows={4} />
      ) : (
        <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-12 pt-4">
          {!shell ? (
            <View className="gap-3">
              <Text className="text-base text-text-muted">No active plan.</Text>
              <Button
                label="Create plan"
                onPress={() => router.push(APP_HREFS.planCreate as Href)}
              />
            </View>
          ) : (
            <>
              {error ? (
                <View className="mb-3 rounded-xl border border-danger/40 bg-tint-error p-3">
                  <Text className="text-sm text-danger">{error}</Text>
                </View>
              ) : null}

              <Text className="mb-2 text-sm text-text-muted">Tap a phase to reorder or edit.</Text>
              <View>
                {blocks.map((b, index) => (
                  <AnimatedPressable
                    key={b.id}
                    hitSlop={8}
                    disabled={busy}
                    onPress={() => openBlockActions(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`${b.name}, ${humanizeBlockType(b.type)}`}
                    className="border-b border-border/80 py-3"
                  >
                    <Text className="text-base font-medium text-text-primary">{b.name}</Text>
                    <Text className="mt-1 text-sm text-text-muted">
                      {[humanizeBlockType(b.type), `${b.durationWeeks} weeks`, b.primaryFocus]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>

              <Text className="mb-2 mt-6 text-sm font-medium text-text-muted">Add block</Text>
              <TextInput
                className="mb-2 rounded-xl border border-border-strong bg-card px-3 py-2.5 text-text-primary"
                placeholder="Name"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
              />
              <View className="mb-2 flex-row flex-wrap gap-2">
                {BLOCK_TYPES.map((t) => (
                  <AnimatedPressable
                    key={t.id}
                    onPress={() => {
                      hapticLight();
                      setType(t.id);
                    }}
                    hitSlop={8}
                    className={`rounded-xl border px-3 py-1.5 ${
                      type === t.id ? 'border-brand bg-brand/15' : 'border-border'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        type === t.id ? 'text-brand' : 'text-text-primary'
                      }`}
                    >
                      {t.label}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>
              <TextInput
                className="mb-3 rounded-xl border border-border-strong bg-card px-3 py-2.5 text-text-primary"
                placeholder="Duration weeks"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                value={weeks}
                onChangeText={setWeeks}
              />
              <Button
                label="Add block"
                loading={busy}
                disabled={busy || !name.trim()}
                onPress={() => {
                  const durationWeeks = Math.max(1, Math.min(12, Number(weeks) || 1));
                  void run(async () => {
                    await create.mutateAsync({
                      planId: shell.id,
                      input: {
                        name: name.trim(),
                        type,
                        primaryFocus: name.trim(),
                        durationWeeks,
                        order: blocks.length,
                      },
                    });
                    setName('');
                  });
                }}
              />
            </>
          )}
        </ScrollView>
      )}

      <BottomSheet
        visible={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        keyboard
        testID="plan-block-rename-sheet"
      >
        <Text className="mb-3 text-lg font-semibold text-text-primary">Rename block</Text>
        <TextInput
          className="mb-4 rounded-xl border border-border-strong bg-card px-3 py-2.5 text-text-primary"
          value={renameValue}
          onChangeText={setRenameValue}
          placeholder="Name"
          placeholderTextColor={theme.textMuted}
          autoFocus
        />
        <Button
          label="Save"
          loading={busy}
          disabled={busy || !renameValue.trim() || !shell || !renameTarget}
          onPress={() => {
            if (!shell || !renameTarget) return;
            const nextName = renameValue.trim();
            void run(async () => {
              await patch.mutateAsync({
                planId: shell.id,
                blockId: renameTarget.id,
                input: { name: nextName, primaryFocus: nextName },
              });
              setRenameTarget(null);
            });
          }}
        />
        <View className="mt-3">
          <Button label="Cancel" variant="secondary" onPress={() => setRenameTarget(null)} />
        </View>
      </BottomSheet>
    </>
  );
}
