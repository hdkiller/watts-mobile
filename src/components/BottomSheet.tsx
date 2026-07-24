/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** When true, wraps the sheet body for keyboard avoidance (forms). */
  keyboard?: boolean;
  /**
   * When false, children render without a ScrollView (native pickers / fixed chrome).
   * Defaults to true.
   */
  scroll?: boolean;
  testID?: string;
};

/**
 * Bottom-anchored modal sheet. Scrim tap dismisses. Grabber is always shown.
 * Prefer this over hand-rolled Modal + flex layouts that can pin content to the top.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  keyboard = false,
  scroll = true,
  testID,
}: Props) {
  const body = (
    <View
      className="max-h-[85%] rounded-t-3xl border-t border-border-strong bg-surface px-6 pb-10 pt-3"
      testID={testID}
    >
      <View className="mb-3 items-center" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View className="h-1 w-10 rounded-full bg-border-strong" />
      </View>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        {keyboard ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {body}
          </KeyboardAvoidingView>
        ) : (
          body
        )}
      </View>
    </Modal>
  );
}
