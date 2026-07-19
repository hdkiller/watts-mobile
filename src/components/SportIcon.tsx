import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Platform, Text, View } from 'react-native';

type Glyph = { sf: SFSymbol; emoji: string };

const GLYPHS: { match: RegExp; glyph: Glyph }[] = [
  { match: /ride|bike|cycl|gravel|mtb/, glyph: { sf: 'bicycle', emoji: '🚴' } },
  { match: /run/, glyph: { sf: 'figure.run', emoji: '🏃' } },
  { match: /swim/, glyph: { sf: 'figure.pool.swim', emoji: '🏊' } },
  { match: /strength|weight|gym|lift/, glyph: { sf: 'dumbbell', emoji: '🏋️' } },
  { match: /walk|hike/, glyph: { sf: 'figure.walk', emoji: '🚶' } },
  { match: /row/, glyph: { sf: 'figure.rower', emoji: '🚣' } },
  { match: /yoga|stretch|mobility/, glyph: { sf: 'figure.mind.and.body', emoji: '🧘' } },
  { match: /rest|recover/, glyph: { sf: 'moon.zzz', emoji: '💤' } },
];

const DEFAULT_GLYPH: Glyph = { sf: 'bolt.fill', emoji: '⚡️' };

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
  return (
    <View
      className="items-center justify-center rounded-full bg-zinc-800/80"
      style={{ width: size * 2, height: size * 2 }}
    >
      {Platform.OS === 'ios' ? (
        <SymbolView name={glyph.sf} size={size} tintColor="#d4d4d8" />
      ) : (
        <Text style={{ fontSize: size - 2 }}>{glyph.emoji}</Text>
      )}
    </View>
  );
}
