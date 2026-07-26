/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Text, View } from 'react-native';

import { BottomSheet } from '@/src/components/BottomSheet';
import { Button } from '@/src/components/Button';

import { fuelStateExplanation, type FuelStateCode } from './mapNutritionStrategy';

type Props = {
  visible: boolean;
  state: FuelStateCode | null;
  isRest?: boolean;
  carbsTarget?: number | null;
  onClose: () => void;
};

export function FuelStateExplainSheet({ visible, state, isRest, carbsTarget, onClose }: Props) {
  const model = fuelStateExplanation({ state, isRest });

  return (
    <BottomSheet
      visible={visible && model != null}
      onClose={onClose}
      testID="fuel-state-explain-sheet"
    >
      {model ? (
        <>
          <Text className="text-lg font-semibold text-text-primary">{model.title}</Text>
          {carbsTarget != null ? (
            <Text className="mt-1 text-sm text-text-muted">
              Today’s carb target · {Math.round(carbsTarget)}g
            </Text>
          ) : null}
          <Text className="mt-4 text-base leading-6 text-text-body">{model.meaning}</Text>
          <Text className="mt-4 text-sm font-semibold text-text-primary">Guidance</Text>
          <Text className="mt-1 text-sm leading-5 text-text-body">{model.guidance}</Text>
          <Text className="mt-4 text-sm leading-5 text-text-muted">{model.note}</Text>
          <View className="mt-6">
            <Button label="Done" onPress={onClose} testID="fuel-state-explain-done" />
          </View>
        </>
      ) : null}
    </BottomSheet>
  );
}
