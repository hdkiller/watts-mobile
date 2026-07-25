/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/Button';

import { fuelStateExplanation, type FuelStateCode } from './mapNutritionStrategy';

type Props = {
  visible: boolean;
  state: FuelStateCode | null;
  isRest?: boolean;
  carbsTarget?: number | null;
  onClose: () => void;
};

export function FuelStateExplainSheet({
  visible,
  state,
  isRest,
  carbsTarget,
  onClose,
}: Props) {
  const model = fuelStateExplanation({ state, isRest });
  if (!model) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8 pt-5">
          <Text className="text-lg font-semibold text-text-primary">{model.title}</Text>
          {carbsTarget != null ? (
            <Text className="mt-1 text-sm text-text-muted">
              Today’s carb target · {Math.round(carbsTarget)}g
            </Text>
          ) : null}
          <Text className="mt-4 text-base leading-6 text-text-body">{model.meaning}</Text>
          <Text className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Guidance
          </Text>
          <Text className="mt-1 text-sm leading-5 text-text-body">{model.guidance}</Text>
          <Text className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Note
          </Text>
          <Text className="mt-1 text-sm leading-5 text-text-muted">{model.note}</Text>
          <View className="mt-8">
            <Button label="Done" onPress={onClose} testID="fuel-state-explain-done" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
