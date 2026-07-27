/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app */
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { AppSymbol } from '@/src/components/AppSymbol';
import { ScoreChip } from '@/src/components/ScoreChip';
import { hapticLight } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

import { AthleteStatusBadge } from './AthleteStatusBadge';
import type { AthleteProfileReport, AthleteReportSection } from './mapAthleteReport';

function BulletRow({ text, tint }: { text: string; tint: string }) {
  return (
    <View className="flex-row gap-2.5">
      <View className="mt-0.5">
        <AppSymbol sf="chevron.right" size={14} tintColor={tint} fallback="›" />
      </View>
      <Text className="min-w-0 flex-1 text-sm leading-5 text-text-body">{text}</Text>
    </View>
  );
}

function LabeledList({
  title,
  titleClass,
  items,
  tint,
}: {
  title: string;
  titleClass: string;
  items: string[];
  tint: string;
}) {
  if (items.length === 0) return null;
  return (
    <View>
      <Text className={`text-sm font-semibold ${titleClass}`}>{title}</Text>
      <View className="mt-2 gap-2.5">
        {items.map((item, index) => (
          <BulletRow key={`${title}-${index}`} text={item} tint={tint} />
        ))}
      </View>
    </View>
  );
}

function FitnessLead({ section }: { section: AthleteReportSection }) {
  const theme = useThemeColors();

  return (
    <View className="mt-6 border-t border-border/80 pt-5">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="min-w-0 flex-1 text-lg font-semibold text-text-primary">
          {section.title}
        </Text>
        {section.badge ? <AthleteStatusBadge badge={section.badge} /> : null}
      </View>

      {section.body ? (
        <Text className="mt-3 text-base leading-6 text-text-body">{section.body}</Text>
      ) : null}

      {section.bullets.length > 0 ? (
        <View className="mt-3 gap-2.5">
          {section.bullets.map((bullet, index) => (
            <BulletRow key={`fitness-${index}`} text={bullet} tint={theme.brandOnSurface} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SecondarySection({ section }: { section: AthleteReportSection }) {
  const theme = useThemeColors();

  return (
    <View className="mt-5 border-t border-border/80 pt-4">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="min-w-0 flex-1 text-base font-semibold text-text-primary">
          {section.title}
        </Text>
        {section.badge ? <AthleteStatusBadge badge={section.badge} /> : null}
      </View>

      {section.body ? (
        <Text className="mt-2 text-sm leading-5 text-text-body">{section.body}</Text>
      ) : null}

      {section.fields.length > 0 ? (
        <View className="mt-3 gap-3">
          {section.fields.map((field) => (
            <View key={field.label}>
              <Text className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {field.label}
              </Text>
              <Text className="mt-1 text-sm leading-5 text-text-body">{field.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {section.kind === 'training' &&
      (section.strengths.length > 0 || section.development.length > 0) ? (
        <View className="mt-3 gap-4">
          <LabeledList
            title="Strengths"
            titleClass="text-success"
            items={section.strengths}
            tint={theme.successOnSurface}
          />
          <LabeledList
            title="Areas for development"
            titleClass="text-recovery"
            items={section.development}
            tint={theme.recoveryOnSurface}
          />
        </View>
      ) : null}

      {section.bullets.length > 0 ? (
        <View className="mt-3 gap-2.5">
          {section.bullets.map((bullet, index) => (
            <BulletRow key={`${section.key}-${index}`} text={bullet} tint={theme.brandOnSurface} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

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
  const fitness = report?.sections.find((section) => section.kind === 'fitness') ?? null;
  const secondary = report?.sections.filter((section) => section.kind !== 'fitness') ?? [];

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
              <View>
                <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Profile overview
                </Text>
                {report.executiveSummary ? (
                  <Text className="mt-2 text-base leading-6 text-text-body">
                    {report.executiveSummary}
                  </Text>
                ) : (
                  <Text className="mt-2 text-sm text-text-muted">No executive summary.</Text>
                )}
                {report.scores.length > 0 ? (
                  <View className="mt-4 flex-row flex-wrap gap-2">
                    {report.scores.map((chip) => (
                      <ScoreChip key={chip.key} label={chip.label} score={chip.score} />
                    ))}
                  </View>
                ) : null}
              </View>

              {fitness ? <FitnessLead section={fitness} /> : null}

              {secondary.map((section) => (
                <SecondarySection key={section.key} section={section} />
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
