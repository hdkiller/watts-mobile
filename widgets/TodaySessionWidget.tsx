import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type TodaySessionWidgetProps = {
  actionLabel: string;
  sessionTitle: string;
  metaLine: string;
};

/** Widget colors follow the OS appearance via SwiftUI semantic styles where possible. */
const TodaySessionWidget = (props: TodaySessionWidgetProps, env: WidgetEnvironment) => {
  'widget';
  const dark = env.colorScheme !== 'light';
  const muted = dark ? '#71717a' : '#52525b';
  const primary = dark ? '#ffffff' : '#09090b';
  const meta = dark ? '#a1a1aa' : '#71717a';

  return (
    <VStack modifiers={[padding({ all: 12 })]}>
      <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(muted)]}>
        TODAY
      </Text>
      <Text modifiers={[font({ size: 16, weight: 'bold' }), foregroundStyle('#00DC82')]}>
        {props.actionLabel || 'Open Coach Watts'}
      </Text>
      <Text modifiers={[font({ size: 14, weight: 'medium' }), foregroundStyle(primary)]}>
        {props.sessionTitle || 'No session loaded'}
      </Text>
      {props.metaLine ? (
        <Text modifiers={[font({ size: 12 }), foregroundStyle(meta)]}>{props.metaLine}</Text>
      ) : null}
    </VStack>
  );
};

export default createWidget('TodaySessionWidget', TodaySessionWidget);
