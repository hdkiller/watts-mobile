import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type TodaySessionWidgetProps = {
  actionLabel: string;
  sessionTitle: string;
  metaLine: string;
};

const TodaySessionWidget = (props: TodaySessionWidgetProps, _env: WidgetEnvironment) => {
  'widget';
  return (
    <VStack modifiers={[padding({ all: 12 })]}>
      <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle('#71717a')]}>
        TODAY
      </Text>
      <Text modifiers={[font({ size: 16, weight: 'bold' }), foregroundStyle('#00DC82')]}>
        {props.actionLabel || 'Open Coach Watts'}
      </Text>
      <Text modifiers={[font({ size: 14, weight: 'medium' }), foregroundStyle('#ffffff')]}>
        {props.sessionTitle || 'No session loaded'}
      </Text>
      {props.metaLine ? (
        <Text modifiers={[font({ size: 12 }), foregroundStyle('#a1a1aa')]}>{props.metaLine}</Text>
      ) : null}
    </VStack>
  );
};

export default createWidget('TodaySessionWidget', TodaySessionWidget);
