import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-xl font-semibold text-text-primary">Screen not found</Text>
        <Link href="/" className="mt-4">
          <Text className="text-brand">Go home</Text>
        </Link>
      </View>
    </>
  );
}
