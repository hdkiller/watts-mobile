import { Modal, Pressable, Text, View } from 'react-native';

import { hapticLight } from '@/src/lib/haptics';

export type MoreAction = {
  key: string;
  label: string;
  onPress: () => void;
};

export function MoreActionsSheet({
  visible,
  actions,
  onClose,
}: {
  visible: boolean;
  actions: MoreAction[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        className="flex-1 justify-end bg-black/50"
        onPress={onClose}
      >
        <Pressable className="rounded-t-2xl border-t border-border bg-surface px-5 pb-10 pt-3">
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-border-strong" />
          {actions.map((action, i) => (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              className={`py-4 active:opacity-70 ${i > 0 ? 'border-t border-border' : ''}`}
              onPress={() => {
                hapticLight();
                onClose();
                action.onPress();
              }}
            >
              <Text className="text-center text-base font-semibold text-text-primary">
                {action.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            className="mt-2 rounded-xl border border-border-strong py-3.5 active:opacity-70"
            onPress={onClose}
          >
            <Text className="text-center text-base font-semibold text-text-muted">Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
