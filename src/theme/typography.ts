/**
 * Dynamic Type & Typography scaling rules for Coach Watts Mobile.
 *
 * Rules:
 * 1. `allowFontScaling` is enabled by default across all React Native `<Text>` and `<TextInput>` nodes.
 * 2. Tight structural headers, badges, and fixed-height touch CTAs specify `maxFontSizeMultiplier`
 *    (e.g., 1.5) to prevent overflow while maintaining accessibility.
 * 3. Body text, prose, and scrollable content should allow natural scaling up to OS limits.
 * 4. Layout containers containing text must use flex wrapping and dynamic padding (`py-3`, `min-h-[44px]`)
 *    instead of hardcoded fixed heights (`h-10`, `h-12`) that clip when scaled.
 */

export const MAX_FONT_SCALE_DEFAULT = 1.5;
export const MAX_FONT_SCALE_BADGE = 1.3;
export const MAX_FONT_SCALE_HERO = 1.25;

export const DynamicTypeRules = {
  allowFontScaling: true,
  maxFontSizeMultiplierDefault: MAX_FONT_SCALE_DEFAULT,
  maxFontSizeMultiplierBadge: MAX_FONT_SCALE_BADGE,
  maxFontSizeMultiplierHero: MAX_FONT_SCALE_HERO,
} as const;

/**
 * Helper to produce standard accessibility font props for text elements that require upper scaling bounds.
 */
export function dynamicFontProps(maxScale: number = MAX_FONT_SCALE_DEFAULT) {
  return {
    allowFontScaling: true,
    maxFontSizeMultiplier: maxScale,
  };
}
