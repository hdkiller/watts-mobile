/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app */
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { ScoreChip } from '@/src/components/ScoreChip';
import { hapticLight } from '@/src/lib/haptics';

import type { AthleteProfileReport } from './mapAthleteReport';

export function AthleteReportSheet({
  visible,
  report,
  onClose,
  onOpenWeb,
}: {
  visible: boolean;
  report: AthleteProfileReport | null;
  onClose: () => void;
  onOpenWeb: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
        <View className="flex-row items-start justify-between border-b border-border px-6 py-4">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-xl font-semibold text-text-primary">AI Athlete Profile</Text>
            <Text className="mt-1 text-sm text-text-muted">Summary from your latest sync.</Text>
          </View>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Done"
            onPress={() => {
              hapticLight();
              onClose();
            }}
            hitSlop={8}
          >
            <Text className="text-sm font-semibold text-brand">Done</Text>
          </AnimatedPressable>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-10 pt-5">
          {!report ? (
            <Text className="text-sm text-text-muted">No report loaded.</Text>
          ) : (
            <>
              {report.fitnessStatusLabel ? (
                <Text className="text-xs font-semibold text-brand">
                  {report.fitnessStatusLabel}
                </Text>
              ) : null}
              {report.executiveSummary ? (
                <Text className="mt-3 text-base leading-6 text-text-body">
                  {report.executiveSummary}
                </Text>
              ) : null}

              {report.scores.length > 0 ? (
                <View className="mt-4 flex-row flex-wrap gap-2">
                  {report.scores.map((chip) => (
                    <ScoreChip key={chip.key} label={chip.label} score={chip.score} />
                  ))}
                </View>
              ) : null}

              {report.sections.map((section) => (
                <View
                  key={section.key}
                  className="mt-5 border-t border-border/80 pt-4"
                >
                  <Text className="text-base font-semibold text-text-primary">
                    {section.title}
                  </Text>
                  {section.body ? (
                    <Text className="mt-2 text-sm leading-5 text-text-body">{section.body}</Text>
                  ) : null}
                  {section.bullets.length > 0 ? (
                    <View className="mt-2 gap-1.5">
                      {section.bullets.map((bullet) => (
                        <Text key={bullet} className="text-sm leading-5 text-text-body">
                          • {bullet}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}

              <AnimatedPressable
                className="mt-6 self-start"
                hitSlop={8}
                onPress={() => {
                  hapticLight();
                  onOpenWeb();
                }}
              >
                <Text className="text-sm font-semibold text-brand">Open full report</Text>
              </AnimatedPressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
