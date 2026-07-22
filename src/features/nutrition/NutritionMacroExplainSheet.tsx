import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppSymbol } from '@/src/components/AppSymbol';
import { Button } from '@/src/components/Button';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

import { buildMacroExplainModel } from './macroExplain';
import { goalProgressPct } from './mapNutrition';
import type { MacroExplainLabel, NutritionDayTotals } from './types';

const ACCENT: Record<
  MacroExplainLabel,
  { color: string; barClass: string; sf: 'flame.fill' | 'leaf' | 'heart.fill' | 'drop.fill' }
> = {
  Calories: { color: '#fb923c', barClass: 'bg-orange-400', sf: 'flame.fill' },
  Carbs: { color: '#fbbf24', barClass: 'bg-amber-400', sf: 'leaf' },
  Protein: { color: '#60a5fa', barClass: 'bg-blue-400', sf: 'heart.fill' },
  Fat: { color: '#a78bfa', barClass: 'bg-violet-400', sf: 'drop.fill' },
};

export function NutritionMacroExplainSheet({
  visible,
  label,
  day,
  weightKg,
  onClose,
}: {
  visible: boolean;
  label: MacroExplainLabel | null;
  day: NutritionDayTotals | null;
  weightKg?: number | null;
  onClose: () => void;
}) {
  const theme = useThemeColors();

  if (!label || !day) return null;

  const model = buildMacroExplainModel({ label, day, weightKg });
  const accent = ACCENT[label];
  const progress = goalProgressPct(model.actual, model.target > 0 ? model.target : null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 pt-5">
          <View className="flex-row items-center justify-between">
            <View className="min-w-0 flex-1 flex-row items-center gap-2 pr-3">
              <AppSymbol
                sf={accent.sf}
                size={22}
                tintColor={accent.color}
                fallback={label === 'Calories' ? '🔥' : '•'}
              />
              <Text className="text-base font-black uppercase tracking-tight text-text-primary">
                {label} Analysis
              </Text>
            </View>
            <Text className="text-2xl font-black" style={{ color: accent.color }}>
              {Math.round(model.actual)}
              {model.unit}
            </Text>
          </View>

          <View className="mt-5 rounded-xl border border-border bg-card px-4 py-3.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Total Daily Target
              </Text>
              <Text className="text-sm font-black text-text-primary">
                {Math.round(model.target)}
                {model.unit}
              </Text>
            </View>
            <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <View
                className={`h-1.5 rounded-full ${accent.barClass}`}
                style={{ width: `${progress ?? 0}%` }}
              />
            </View>
          </View>

          <View className="mt-6">
            <View className="mb-2 flex-row items-center gap-1.5">
              <AppSymbol
                sf="gauge.with.dots.needle.33percent"
                size={14}
                tintColor={theme.textMuted}
                fallback="⌁"
              />
              <Text className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Calculation logic
              </Text>
            </View>

            {model.rows.length === 0 ? (
              <Text className="py-3 text-sm text-text-muted">
                Target details are not available for this day yet.
              </Text>
            ) : (
              model.rows.map((row) => (
                <View
                  key={`${row.label}-${row.value}`}
                  className="flex-row items-start justify-between border-b border-border py-3 last:border-b-0"
                >
                  <View className="min-w-0 flex-1 pr-3">
                    <View className="flex-row flex-wrap items-center gap-1.5">
                      <Text className="text-sm font-bold text-text-primary">{row.label}</Text>
                      {row.badgeLabel ? (
                        <View className="rounded bg-border px-1.5 py-0.5">
                          <Text className="text-[9px] font-black uppercase tracking-wide text-text-muted">
                            {row.badgeLabel}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="mt-0.5 text-[11px] leading-snug text-text-muted">
                      {row.description}
                    </Text>
                  </View>
                  <Text className="text-sm font-black text-text-primary">{row.value}</Text>
                </View>
              ))
            )}
          </View>

          <View className="mt-5 rounded-xl border border-brand/40 bg-tint-success px-4 py-3.5">
            <View className="flex-row items-center gap-2">
              <AppSymbol sf="bolt.fill" size={16} tintColor={Colors.brand} fallback="💡" />
              <Text className="text-sm font-bold text-brand">Coach Insight</Text>
            </View>
            <Text className="mt-1.5 text-xs italic leading-relaxed text-brand/90">
              {model.coachTip}
            </Text>
          </View>

          <Button className="mt-6" label="Close" variant="secondary" onPress={onClose} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
