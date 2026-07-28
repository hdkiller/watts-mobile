import { describe, expect, it } from 'vitest';

import { DynamicTypeRules, MAX_FONT_SCALE_DEFAULT, dynamicFontProps } from '@/src/theme/typography';

describe('typography theme rules', () => {
  it('defines dynamic type rules with allowFontScaling enabled', () => {
    expect(DynamicTypeRules.allowFontScaling).toBe(true);
    expect(DynamicTypeRules.maxFontSizeMultiplierDefault).toBe(1.5);
    expect(DynamicTypeRules.maxFontSizeMultiplierBadge).toBe(1.3);
    expect(DynamicTypeRules.maxFontSizeMultiplierHero).toBe(1.25);
  });

  it('generates dynamicFontProps with default scaling cap', () => {
    const props = dynamicFontProps();
    expect(props).toEqual({
      allowFontScaling: true,
      maxFontSizeMultiplier: MAX_FONT_SCALE_DEFAULT,
    });
  });

  it('generates dynamicFontProps with custom scaling cap', () => {
    const props = dynamicFontProps(1.3);
    expect(props).toEqual({
      allowFontScaling: true,
      maxFontSizeMultiplier: 1.3,
    });
  });
});
