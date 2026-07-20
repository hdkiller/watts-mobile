import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

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
      <View className="flex-1 bg-surface-dark">
        <View className="flex-row items-start justify-between border-b border-zinc-800 px-5 py-4">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-xl font-semibold text-white">AI Athlete Profile</Text>
            <Text className="mt-1 text-sm text-ink-muted">
              Lite report from your latest sync. Full history and share tools stay on web.
            </Text>
          </View>
          <Pressable onPress={onClose} className="active:opacity-70" hitSlop={8}>
            <Text className="text-sm font-semibold text-brand">Done</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-5">
          {!report ? (
            <Text className="text-sm text-ink-muted">No report loaded.</Text>
          ) : (
            <>
              {report.fitnessStatusLabel ? (
                <Text className="text-xs font-semibold text-brand">
                  {report.fitnessStatusLabel}
                </Text>
              ) : null}
              {report.executiveSummary ? (
                <Text className="mt-3 text-base leading-6 text-zinc-100">
                  {report.executiveSummary}
                </Text>
              ) : null}

              {report.scores.length > 0 ? (
                <View className="mt-4 flex-row flex-wrap gap-2">
                  {report.scores.map((chip) => (
                    <View
                      key={chip.key}
                      className="rounded-full border border-zinc-700 bg-zinc-950/60 px-2.5 py-1"
                    >
                      <Text className="text-[11px] font-semibold text-zinc-300">
                        {chip.label} {chip.score}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {report.sections.map((section) => (
                <View
                  key={section.key}
                  className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3.5"
                >
                  <Text className="text-xs uppercase tracking-wide text-ink-muted">
                    {section.title}
                  </Text>
                  {section.body ? (
                    <Text className="mt-2 text-sm leading-5 text-zinc-200">{section.body}</Text>
                  ) : null}
                  {section.bullets.length > 0 ? (
                    <View className="mt-2 gap-1.5">
                      {section.bullets.map((bullet) => (
                        <Text key={bullet} className="text-sm leading-5 text-zinc-300">
                          • {bullet}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}

              <Pressable className="mt-6 active:opacity-70" onPress={onOpenWeb}>
                <Text className="text-sm font-semibold text-brand">
                  Open full report on web
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
