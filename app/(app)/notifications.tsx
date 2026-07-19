import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

/**
 * Inbox stub so deep links / push `data.path` `/notifications` resolve.
 * Full inbox lands with OpenSpec `phase-2-notifications-push`.
 */
export default function NotificationsStubScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Notifications' }} />
      <View className="flex-1 bg-surface-dark px-6 pt-6">
        <Text className="text-xl font-semibold text-white">Notifications</Text>
        <Text className="mt-2 text-base text-ink-muted">
          Inbox arrives with push registration. Deep links already resolve here.
        </Text>
      </View>
    </>
  );
}
