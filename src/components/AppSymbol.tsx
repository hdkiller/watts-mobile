import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { Text, type StyleProp, type ViewStyle } from 'react-native';

/**
 * SF Symbol → Material Symbol for Android/web.
 * Keep in sync when adding icons — Android has no SF Symbols.
 */
const SF_TO_MD = {
  'chevron.right': 'chevron_right',
  'chevron.left': 'chevron_left',
  'chevron.down': 'expand_more',
  'list.bullet': 'format_list_bulleted',
  'list.bullet.rectangle': 'list_alt',
  calendar: 'calendar_month',
  'person.crop.circle': 'account_circle',
  bell: 'notifications',
  gearshape: 'settings',
  globe: 'language',
  'hand.raised': 'privacy_tip',
  'doc.text': 'description',
  'questionmark.circle': 'help',
  'circle.lefthalf.filled': 'contrast',
  heart: 'favorite',
  'heart.fill': 'favorite',
  ruler: 'straighten',
  'figure.run': 'directions_run',
  link: 'link',
  'link.circle': 'devices',
  'bubble.left.and.bubble.right': 'forum',
  'square.and.arrow.up': 'ios_share',
  trash: 'delete',
  'drop.fill': 'water_drop',
  'clock.fill': 'schedule',
  'moon.stars': 'moon_stars',
  'waveform.path.ecg': 'ecg',
  'wrench.and.screwdriver': 'build',
  plus: 'add',
  checkmark: 'check',
  'checkmark.circle': 'check_circle',
  'checkmark.circle.fill': 'check_circle',
  'arrow.up': 'arrow_upward',
  eye: 'visibility',
  thermometer: 'device_thermostat',
  'cross.case.fill': 'medical_services',
  'battery.25percent': 'battery_2_bar',
  'cloud.bolt': 'thunderstorm',
  allergens: 'allergy',
  'bolt.fill': 'bolt',
  'arrow.triangle.2.circlepath': 'autorenew',
  'square.and.pencil': 'edit_note',
  leaf: 'eco',
  'leaf.fill': 'eco',
  'flame.fill': 'local_fire_department',
  'dumbbell.fill': 'fitness_center',
  'drop.halffull': 'opacity',
  'gauge.with.dots.needle.33percent': 'speed',
  'exclamationmark.triangle': 'warning',
  'heart.text.square.fill': 'health_and_safety',
} as const satisfies Record<string, AndroidSymbol>;

export type MappedSFSymbol = keyof typeof SF_TO_MD;

/** Cross-platform glyph: SF Symbols on iOS, Material Symbols on Android. */
export function AppSymbol({
  sf,
  md,
  size = 18,
  tintColor,
  fallback,
  style,
}: {
  sf: SFSymbol;
  /** Override Material Symbol when the shared map has no entry. */
  md?: AndroidSymbol;
  size?: number;
  tintColor?: string;
  /** Emoji / text shown only if the platform glyph cannot load. */
  fallback?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const android = md ?? (SF_TO_MD as Record<string, AndroidSymbol | undefined>)[sf];
  return (
    <SymbolView
      name={android ? { ios: sf, android, web: android } : sf}
      size={size}
      tintColor={tintColor}
      style={style}
      fallback={
        fallback != null ? (
          <Text style={{ fontSize: Math.max(10, size - 2), color: tintColor }}>{fallback}</Text>
        ) : undefined
      }
    />
  );
}
