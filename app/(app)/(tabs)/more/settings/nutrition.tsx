/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { DetailSkeleton } from '@/src/components/Skeleton';
import { NutritionSettingsForm } from '@/src/features/nutrition/NutritionSettingsForm';
import { useNutritionSettingsQuery } from '@/src/features/nutrition/useNutritionSettings';
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
      <SafeAreaView edges={{ bottom: true }} style={{ flex: 1, backgroundColor: theme.surface }}>
        {isLoading && !data ? (
          <DetailSkeleton />
        ) : isError && !data ? (
          <View className="flex-1 items-center justify-center bg-surface px-6">
            <Text className="text-center text-base text-text-primary">
              {friendlyError(error, 'Failed to load nutrition settings')}
            </Text>
            <Button
              className="mt-4"
              label={isFetching ? 'Retrying…' : 'Retry'}
              loading={isFetching}
              onPress={() => void refetch()}
            />
          </View>
        ) : data ? (
          <NutritionSettingsForm initial={data} />
        ) : null}
      </SafeAreaView>
    </>
  );
}
