import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { Themes } from '../colors';

/**
 * WCAG 2.1 relative luminance / contrast ratio.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const AA_NORMAL = 4.5;
const AA_LARGE = 3;

describe('contrastRatio', () => {
  it('matches known WCAG reference pairs', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });
});

describe('brand as foreground', () => {
  it('clears AA for normal text on both themes', () => {
    expect(contrastRatio(Themes.light.brandOnSurface, Themes.light.surface)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(Themes.light.brandOnSurface, Themes.light.card)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(Themes.dark.brandOnSurface, Themes.dark.surface)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(Themes.dark.brandOnSurface, Themes.dark.card)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it('keeps the vivid brand on dark, where it already passes', () => {
    expect(Themes.dark.brandOnSurface).toBe(Themes.dark.brand);
  });

  it('documents why light mode cannot reuse the fill colour', () => {
    // The regression this whole token exists to prevent.
    expect(contrastRatio(Themes.light.brand, Themes.light.surface)).toBeLessThan(AA_LARGE);
  });
});

describe('brand as fill', () => {
  it('stays theme-invariant so ink-on-brand keeps its contrast', () => {
    expect(Themes.light.brand).toBe(Themes.dark.brand);
    for (const theme of [Themes.light, Themes.dark]) {
      expect(contrastRatio(theme.ink, theme.brand)).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });
});

describe('token sources agree', () => {
  const css = readFileSync('global.css', 'utf8');

  /** `--color-brand-on-surface: R G B;` → `#rrggbb`, per theme block. */
  function cssBrand(block: string): string {
    const scope = css.split(block)[1] ?? '';
    const m = /--color-brand-on-surface:\s*(\d+)\s+(\d+)\s+(\d+)/.exec(scope);
    if (!m) throw new Error(`no --color-brand-on-surface after "${block}"`);
    return (
      '#' +
      [m[1], m[2], m[3]]
        .map((v) => Number(v).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    );
  }

  it('keeps global.css in sync with the TS theme map', () => {
    expect(cssBrand(':root {')).toBe(Themes.light.brandOnSurface.toUpperCase());
    expect(cssBrand('prefers-color-scheme: dark')).toBe(Themes.dark.brandOnSurface.toUpperCase());
  });

  it('points tailwind text-brand at the variable, not a literal', () => {
    const config = readFileSync('tailwind.config.js', 'utf8');
    const textColor = config.split('textColor:')[1] ?? '';
    expect(textColor).toContain('var(--color-brand-on-surface)');
    // bg-brand / border-brand must keep the invariant fill.
    expect(config).toContain("DEFAULT: '#00DC82'");
  });
});
