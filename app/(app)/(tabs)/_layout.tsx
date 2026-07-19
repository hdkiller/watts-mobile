import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/src/theme/colors';

const tabContentStyle = { backgroundColor: Colors.background };

export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={Colors.brand}
      backgroundColor={Colors.background}
      iconColor={{ default: Colors.textMuted, selected: Colors.brand }}
      labelStyle={{
        default: { color: Colors.textMuted },
        selected: { color: Colors.brand },
      }}
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="today" contentStyle={tabContentStyle}>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'sun.max', selected: 'sun.max.fill' }}
          md="sunny"
        />
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="log" contentStyle={tabContentStyle}>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.and.pencil', selected: 'square.and.pencil' }}
          md="edit_note"
        />
        <NativeTabs.Trigger.Label>Log</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="coach"
        disableAutomaticContentInsets
        contentStyle={tabContentStyle}
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }}
          md="forum"
        />
        <NativeTabs.Trigger.Label>Coach</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more" role="more" contentStyle={tabContentStyle}>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'ellipsis.circle', selected: 'ellipsis.circle.fill' }}
          md="more_horiz"
        />
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
