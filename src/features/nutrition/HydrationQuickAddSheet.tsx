import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { AppSymbol } from '@/src/components/AppSymbol';
import { localDateYmd } from '@/src/features/nutrition/mapNutrition';
import { useQuickAddHydration } from '@/src/features/nutrition/useNutrition';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

const PRESETS = [
  { ml: 250, label: '250 ml', sub: 'Glass of water' },
  { ml: 500, label: '500 ml', sub: 'Standard bottle' },
  { ml: 750, label: '750 ml', sub: 'Large shaker' },
  { ml: 1000, label: '1,000 ml', sub: '1 Liter jug' },
];

interface HydrationQuickAddSheetProps {
  visible: boolean;
  onClose: () => void;
  currentWaterMl?: number;
  targetWaterMl?: number | null;
}

export function HydrationQuickAddSheet({
  visible,
  onClose,
  currentWaterMl = 0,
  targetWaterMl,
}: HydrationQuickAddSheetProps) {
  const theme = useThemeColors();
  const hydrationMutation = useQuickAddHydration();

  const [lastAddedMl, setLastAddedMl] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (volumeMl: number) => {
    hapticLight();
    setError(null);
    try {
      await hydrationMutation.mutateAsync({ date: localDateYmd(), volumeMl });
      hapticSuccess();
      setLastAddedMl(volumeMl);
      setTimeout(() => {
        setLastAddedMl(null);
        onClose();
      }, 1200);
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Hydration failed'));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable className="rounded-t-3xl bg-surface px-6 pt-4 pb-10">
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-strong" />

          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <AppSymbol sf="drop.fill" size={20} tintColor="#60a5fa" fallback="💧" />
              <Text className="text-xl font-bold text-text-primary">Add Water</Text>
            </View>
            <Pressable hitSlop={8} onPress={onClose} className="p-1 active:opacity-70">
              <Text className="text-base font-semibold text-text-muted">Close</Text>
            </Pressable>
          </View>

          {targetWaterMl != null ? (
            <Text className="mb-4 text-xs text-text-muted">
              Current: {(currentWaterMl / 1000).toFixed(1)} L / {(targetWaterMl / 1000).toFixed(1)} L goal
            </Text>
          ) : (
            <Text className="mb-4 text-xs text-text-muted">Select volume to add to today's hydration total</Text>
          )}

          {/* Presets Grid */}
          <View className="gap-2.5">
            {PRESETS.map((p) => (
              <Pressable
                key={p.ml}
                accessibilityRole="button"
                accessibilityLabel={`Add ${p.label}`}
                className="flex-row items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 active:opacity-80"
                onPress={() => void handleAdd(p.ml)}
                disabled={hydrationMutation.isPending}
              >
                <View>
                  <Text className="text-base font-bold text-text-primary">+{p.label}</Text>
                  <Text className="text-xs text-text-muted">{p.sub}</Text>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-border-strong">
                  <AppSymbol sf="drop.fill" size={14} tintColor={theme.textPrimary} fallback="💧" />
                </View>
              </Pressable>
            ))}
          </View>

          {hydrationMutation.isPending ? (
            <ActivityIndicator className="mt-4" color={Colors.brand} />
          ) : null}
          {error ? <Text className="mt-3 text-xs text-red-400">{error}</Text> : null}
          {lastAddedMl ? (
            <View className="mt-4 rounded-xl border border-success/40 bg-tint-success p-3">
              <Text className="text-center text-xs font-bold text-green-400">
                ✓ Added {lastAddedMl} ml to today's total
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
