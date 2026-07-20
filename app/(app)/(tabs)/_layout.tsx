import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useUnreadNotificationsCount } from '@/src/features/notifications/useNotifications';
import { useThemeColors } from '@/src/theme/useThemeColors';

function moreBadgeLabel(count: number): string | null {
  if (count <= 0) return null;
  return count > 9 ? '9+' : String(count);
}

export default function TabsLayout() {
  const unreadCount = useUnreadNotificationsCount();
  const moreBadge = moreBadgeLabel(unreadCount);
  const theme = useThemeColors();
  const tabContentStyle = { backgroundColor: theme.surface };

  return (
    <NativeTabs
      tintColor={theme.brand}
      backgroundColor={theme.surface}
      iconColor={{ default: theme.textMuted, selected: theme.brand }}
      labelStyle={{
        default: { color: theme.textMuted },
        selected: { color: theme.brand },
      }}
      // Material 3 defaults to selected-only labels (icons misalign). Match iOS: always labeled.
      labelVisibilityMode="labeled"
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
        {moreBadge ? <NativeTabs.Trigger.Badge>{moreBadge}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
