import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import { View } from 'react-native';

import { AppSymbol } from '@/src/components/AppSymbol';
import { useThemeColors } from '@/src/theme/useThemeColors';

type Glyph = { sf: SFSymbol; md: AndroidSymbol; emoji: string };

const GLYPHS: { match: RegExp; glyph: Glyph }[] = [
  { match: /ride|bike|cycl|gravel|mtb/, glyph: { sf: 'bicycle', md: 'directions_bike', emoji: '🚴' } },
  { match: /run/, glyph: { sf: 'figure.run', md: 'directions_run', emoji: '🏃' } },
  { match: /swim/, glyph: { sf: 'figure.pool.swim', md: 'pool', emoji: '🏊' } },
  {
    match: /strength|weight|gym|lift/,
    glyph: { sf: 'dumbbell', md: 'fitness_center', emoji: '🏋️' },
  },
  { match: /walk|hike/, glyph: { sf: 'figure.walk', md: 'directions_walk', emoji: '🚶' } },
  { match: /row/, glyph: { sf: 'figure.rower', md: 'rowing', emoji: '🚣' } },
  {
    match: /yoga|stretch|mobility/,
    glyph: { sf: 'figure.mind.and.body', md: 'self_improvement', emoji: '🧘' },
  },
  { match: /rest|recover/, glyph: { sf: 'moon.zzz', md: 'bedtime', emoji: '💤' } },
];

const DEFAULT_GLYPH: Glyph = { sf: 'bolt.fill', md: 'bolt', emoji: '⚡️' };

function glyphForType(type: string | null | undefined): Glyph {
  if (!type) return DEFAULT_GLYPH;
  const needle = type.toLowerCase();
  return GLYPHS.find((entry) => entry.match.test(needle))?.glyph ?? DEFAULT_GLYPH;
}

/** Small circular sport glyph for workout rows and cards. */
export function SportIcon({
  type,
  size = 16,
}: {
  type: string | null | undefined;
  size?: number;
}) {
  const glyph = glyphForType(type);
  const theme = useThemeColors();
  return (
    <View
      className="items-center justify-center rounded-full bg-border-strong/80"
      style={{ width: size * 2, height: size * 2 }}
    >
      <AppSymbol
        sf={glyph.sf}
        md={glyph.md}
        size={size}
        tintColor={theme.textBody}
        fallback={glyph.emoji}
      />
    </View>
  );
}
