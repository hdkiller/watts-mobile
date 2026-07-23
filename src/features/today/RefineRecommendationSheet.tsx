import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/Button';
import { useThemeColors } from '@/src/theme/useThemeColors';

export function RefineRecommendationSheet({
  visible,
  submitting = false,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}) {
  const theme = useThemeColors();
  const [feedback, setFeedback] = useState('');

  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setFeedback('');
  }

  const trimmed = feedback.trim();
  const submitLabel = trimmed ? 'Refine Plan' : 'Refresh Data';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
        <View className="flex-row items-start justify-between border-b border-border px-5 py-4">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-xl font-semibold text-text-primary">Refine or Refresh</Text>
            <Text className="mt-1 text-sm leading-5 text-text-muted">
              Provide feedback to adjust the plan, or leave empty to simply refresh with latest data.
            </Text>
          </View>
          <Pressable onPress={onClose} className="active:opacity-70" hitSlop={8} disabled={submitting}>
            <Text className="text-sm font-semibold text-brand">Cancel</Text>
          </Pressable>
        </View>

        <View className="flex-1 px-5 pt-5">
          <Text className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Your Feedback (Optional)
          </Text>
          <Text className="mt-1 text-sm text-text-muted">
            The coach will re-evaluate your data. Add context to guide the new plan.
          </Text>
          <TextInput
            className="mt-3 min-h-[140px] rounded-xl border border-border-strong bg-card px-3 py-3 text-base text-text-primary"
            placeholder="e.g. 'I'm feeling extra tired today', 'I want to do a harder session'. Leave empty for a quick refresh."
            placeholderTextColor={theme.textMuted}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            textAlignVertical="top"
            editable={!submitting}
            autoFocus
          />
        </View>

        <View className="gap-3 border-t border-border px-5 py-4">
          <Button
            label={submitLabel}
            onPress={() => onSubmit(trimmed)}
            loading={submitting}
          />
          <Button variant="secondary" label="Cancel" onPress={onClose} disabled={submitting} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
