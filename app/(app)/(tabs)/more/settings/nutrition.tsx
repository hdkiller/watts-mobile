import { Stack } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import { NutritionSettingsForm } from '@/src/features/nutrition/NutritionSettingsForm';
import { useNutritionSettingsQuery } from '@/src/features/nutrition/useNutritionSettings';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function NutritionSettingsScreen() {
  const theme = useThemeColors();
  const { data, isLoading, isError, error, refetch, isFetching } = useNutritionSettingsQuery();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nutrition',
          headerShown: true,
        }}
      />
      <SafeAreaView
        edges={{ bottom: true }}
        style={{ flex: 1, backgroundColor: theme.surface }}
      >
        {isLoading && !data ? (
          <View className="flex-1 items-center justify-center bg-surface">
            <ActivityIndicator color={Colors.brand} size="large" />
          </View>
        ) : isError && !data ? (
          <View className="flex-1 items-center justify-center bg-surface px-6">
            <Text className="text-center text-base text-text-primary">
              {friendlyError(error, 'Failed to load nutrition settings')}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="mt-4 rounded-xl bg-brand-action px-4 py-3 active:opacity-80"
              onPress={() => void refetch()}
            >
              <Text className="text-base font-semibold text-ink">
                {isFetching ? 'Retrying…' : 'Retry'}
              </Text>
            </Pressable>
          </View>
        ) : data ? (
          <NutritionSettingsForm initial={data} />
        ) : null}
      </SafeAreaView>
    </>
  );
}
