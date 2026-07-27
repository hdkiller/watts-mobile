/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Themes, type ThemeColors } from './colors';

export const GradientScale = {
  breaks: [-10, -6, -3, -1.2, 1.2, 3, 6, 10],
  dark: [
    '#86b6ef',
    '#5598e7',
    '#3987e5',
    '#2f6ea8',
    '#55554f',
    '#a85b58',
    '#e34948',
    '#ea6b6a',
    '#f39d9c',
  ],
  light: [
    '#0d366b',
    '#184f95',
    '#256abf',
    '#7fb0ea',
    '#d9d8d2',
    '#f0b3b2',
    '#e34948',
    '#c22e2d',
    '#8f1f1e',
  ],
} as const;

export function gradientColors(theme: ThemeColors): readonly string[] {
  return theme.surface === Themes.light.surface ? GradientScale.light : GradientScale.dark;
}

export function gradientColor(gradePct: number, colors: readonly string[]): string {
  let index = 0;
  while (index < GradientScale.breaks.length && gradePct >= GradientScale.breaks[index]!) {
    index += 1;
  }
  return colors[index] ?? colors[colors.length - 1] ?? Themes.dark.textMuted;
}
