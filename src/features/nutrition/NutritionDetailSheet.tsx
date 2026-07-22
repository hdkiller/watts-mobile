import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { NutritionSection } from '@/src/features/nutrition/NutritionSection';
import { useThemeColors } from '@/src/theme/useThemeColors';

interface NutritionDetailSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function NutritionDetailSheet({ visible, onClose }: NutritionDetailSheetProps) {
  const theme = useThemeColors();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-surface px-6 pt-4 pb-10"
          style={{ maxHeight: '90%' }}
        >
          {/* Sheet Handle */}
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-strong" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-xl font-bold text-text-primary">Nutrition & Hydration</Text>
              <Text className="text-xs text-text-muted">Daily macro breakdown and targets</Text>
            </View>
            <Pressable hitSlop={8} onPress={onClose} className="p-1 active:opacity-70">
              <Text className="text-base font-semibold text-text-muted">Close</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <NutritionSection />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
