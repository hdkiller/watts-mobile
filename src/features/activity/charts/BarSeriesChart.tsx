import { Text, View } from 'react-native';

import type { ZoneBar } from '../chartTypes';
import { Colors, zoneColor } from '@/src/theme/colors';

type BarItem = {
  key: string;
  label: string;
  detail?: string;
  valueLabel: string;
  fraction: number;
  /** Per-bar fill; falls back to chart `accent` when omitted. */
  color?: string;
};

type Props = {
  items: BarItem[];
  accent?: string;
};

export function BarSeriesChart({ items, accent = Colors.brand }: Props) {
  if (items.length === 0) return null;

  return (
    <View>
      {items.map((item) => (
        <View key={item.key} className="mt-3">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-sm text-text-body">{item.label}</Text>
            <Text className="text-xs text-text-muted">{item.valueLabel}</Text>
          </View>
          {item.detail ? (
            <Text className="mt-0.5 text-[11px] text-text-muted">{item.detail}</Text>
          ) : null}
          <View className="mt-1.5 h-2 overflow-hidden rounded-full bg-border-strong">
            <View
              className="h-2 rounded-full"
              style={{
                width: `${Math.max(Math.round(item.fraction * 100), item.fraction > 0 ? 2 : 0)}%`,
                backgroundColor: item.color ?? accent,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export function zoneBarsToItems(bars: ZoneBar[]): BarItem[] {
  return bars.map((b, index) => ({
    key: b.key,
    label: b.label,
    detail: b.detail,
    valueLabel: `${b.minutes < 10 ? b.minutes.toFixed(1) : Math.round(b.minutes)} min`,
    fraction: b.fraction,
    color: zoneColor(index),
  }));
}

export function powerCurveToItems(
  points: { label: string; power: number }[]
): BarItem[] {
  const max = Math.max(...points.map((p) => p.power), 1);
  return points.map((p) => ({
    key: p.label,
    label: p.label,
    valueLabel: `${p.power} W`,
    fraction: p.power / max,
  }));
}
