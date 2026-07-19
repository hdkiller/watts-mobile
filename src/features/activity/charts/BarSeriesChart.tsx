import { Text, View } from 'react-native';

import type { ZoneBar } from '../chartTypes';
import { Colors } from '@/src/theme/colors';

type BarItem = {
  key: string;
  label: string;
  detail?: string;
  valueLabel: string;
  fraction: number;
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
            <Text className="text-sm text-zinc-100">{item.label}</Text>
            <Text className="text-xs text-ink-muted">{item.valueLabel}</Text>
          </View>
          {item.detail ? (
            <Text className="mt-0.5 text-[11px] text-ink-muted">{item.detail}</Text>
          ) : null}
          <View className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-800">
            <View
              className="h-2 rounded-full"
              style={{
                width: `${Math.max(Math.round(item.fraction * 100), item.fraction > 0 ? 2 : 0)}%`,
                backgroundColor: accent,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export function zoneBarsToItems(bars: ZoneBar[]): BarItem[] {
  return bars.map((b) => ({
    key: b.key,
    label: b.label,
    detail: b.detail,
    valueLabel: `${b.minutes < 10 ? b.minutes.toFixed(1) : Math.round(b.minutes)} min`,
    fraction: b.fraction,
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
