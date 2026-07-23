/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { ScoreChip } from '@/src/components/ScoreChip';
import { Skeleton } from '@/src/components/Skeleton';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

import { AthleteReportSheet } from './AthleteReportSheet';
import {
  fetchLatestAthleteProfileReport,
  generateAthleteProfile,
  pollAthleteProfileReport,
} from './athleteReport';
import { ageFromDob, countryFlag } from './mapProfile';
import type { AthleteProfile } from './types';

export const ATHLETE_PROFILE_REPORT_KEY = ['reports', 'athlete-profile', 'latest'] as const;

export function AthleteProfileOverview({
  profile,
  onOpenWebReport,
  onReauth,
}: {
  profile: AthleteProfile;
  onOpenWebReport: () => void;
  onReauth: () => void;
}) {
  const queryClient = useQueryClient();
  const reportQuery = useQuery({
    queryKey: ATHLETE_PROFILE_REPORT_KEY,
    queryFn: fetchLatestAthleteProfileReport,
    staleTime: 30_000,
    retry: (count, error) => {
      const status = (error as { status?: number } | null)?.status;
      if (status === 401 || status === 403) return false;
      return count < 2;
    },
  });

  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const flag = countryFlag(profile.country);
  const age = ageFromDob(profile.dob);
  const displayName = profile.name || profile.nickname || profile.email || 'Athlete';
  const reportForbidden =
    reportQuery.isError &&
    ((reportQuery.error as { status?: number } | null)?.status === 401 ||
      (reportQuery.error as { status?: number } | null)?.status === 403);

  const completedReport =
    reportQuery.data?.status === 'COMPLETED' ? reportQuery.data : null;
  const canOpenLiteSheet = Boolean(
    completedReport?.executiveSummary || (completedReport?.sections.length ?? 0) > 0
  );

  const onSync = async () => {
    setSyncError(null);
    setSyncing(true);
    hapticLight();
    try {
      await generateAthleteProfile();
      const report = await pollAthleteProfileReport();
      queryClient.setQueryData(ATHLETE_PROFILE_REPORT_KEY, report);
      if (report?.status === 'FAILED') {
        hapticError();
        setSyncError('Profile generation failed. Try again or open Coach Watts.');
      } else if (report?.status !== 'COMPLETED') {
        setSyncError('Still generating. Pull to refresh, or open Coach Watts in a minute.');
      } else {
        hapticSuccess();
      }
    } catch (err) {
      hapticError();
      const status = (err as { status?: number } | null)?.status;
      if (status === 401 || status === 403) {
        setSyncError(
          'This session cannot generate AI reports. Sign out and sign in again to refresh permissions.'
        );
      } else {
        setSyncError(friendlyError(err, 'Could not sync athlete profile'));
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            {flag ? <Text className="text-2xl">{flag}</Text> : null}
            <Text className="shrink text-2xl font-semibold text-text-primary" numberOfLines={2}>
              {displayName}
            </Text>
          </View>
          {age != null ? (
            <Text className="mt-1 text-sm text-text-muted">{age} yrs</Text>
          ) : null}
        </View>
        {!reportForbidden ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Sync athlete profile"
            disabled={syncing}
            hitSlop={8}
            onPress={() => void onSync()}
            className="min-h-11 min-w-11 items-center justify-center rounded-full border border-border-strong px-3"
          >
            {syncing ? (
              <ActivityIndicator color={Colors.brand} size="small" />
            ) : (
              <Text className="text-xs font-semibold text-brand">Sync</Text>
            )}
          </AnimatedPressable>
        ) : null}
      </View>

      <HrMetrics
        maxHr={profile.maxHr}
        restingHr={profile.restingHr}
        lthr={profile.lthr}
      />

      <View className="mt-5">
        {reportQuery.isLoading && !reportQuery.data ? (
          <View>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </View>
        ) : reportForbidden ? (
          <View className="rounded-xl border border-border-strong bg-card/60 px-4 py-3.5">
            <Text className="text-sm text-text-muted">
              New permissions are available for AI reports — a quick access update unlocks them.
            </Text>
            <AnimatedPressable
              className="mt-3 self-start"
              hitSlop={8}
              onPress={() => {
                hapticLight();
                onReauth();
              }}
            >
              <Text className="text-sm font-semibold text-brand">Update access</Text>
            </AnimatedPressable>
            <AnimatedPressable
              className="mt-3 self-start"
              hitSlop={8}
              onPress={() => {
                hapticLight();
                onOpenWebReport();
              }}
            >
              <Text className="text-sm font-semibold text-text-body">Open Athlete Profile</Text>
            </AnimatedPressable>
          </View>
        ) : reportQuery.isError ? (
          <View className="rounded-xl border border-danger/40 bg-tint-error px-4 py-3.5">
            <Text className="text-sm text-red-400">
              {friendlyError(reportQuery.error, 'Could not load AI profile')}
            </Text>
            <AnimatedPressable
              className="mt-3 self-start"
              hitSlop={8}
              onPress={() => {
                hapticLight();
                void reportQuery.refetch();
              }}
            >
              <Text className="text-sm font-semibold text-brand">Retry</Text>
            </AnimatedPressable>
          </View>
        ) : reportQuery.data?.status === 'PENDING' ||
          reportQuery.data?.status === 'PROCESSING' ? (
          <Text className="text-sm text-text-muted">Generating your athlete profile…</Text>
        ) : completedReport?.executiveSummary ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="View AI athlete profile report"
            disabled={!canOpenLiteSheet}
            onPress={() => {
              hapticLight();
              setSheetOpen(true);
            }}
          >
            {completedReport.fitnessStatusLabel ? (
              <Text className="mb-2 text-xs font-semibold text-brand">
                {completedReport.fitnessStatusLabel}
              </Text>
            ) : (
              <Text className="mb-2 text-xs font-semibold text-text-muted">Latest sync</Text>
            )}
            <Text className="text-sm leading-5 text-text-body">
              {completedReport.executiveSummary}
            </Text>
            {completedReport.scores.length > 0 ? (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {completedReport.scores.map((chip) => (
                  <ScoreChip key={chip.key} label={chip.label} score={chip.score} />
                ))}
              </View>
            ) : null}
            {completedReport.recommendationsSummary ? (
              <Text className="mt-3 text-sm text-text-muted">
                {completedReport.recommendationsSummary}
              </Text>
            ) : null}
            {canOpenLiteSheet ? (
              <Text className="mt-3 text-sm font-semibold text-brand">View report</Text>
            ) : null}
          </AnimatedPressable>
        ) : (
          <Text className="text-sm text-text-muted">
            No AI athlete profile yet. Sync to generate one, or open the full report.
          </Text>
        )}

        {syncError ? (
          <View className="mt-3 rounded-xl border border-danger/40 bg-tint-error px-4 py-3.5">
            <Text className="text-sm text-red-400">{syncError}</Text>
          </View>
        ) : null}

        <AnimatedPressable
          className="mt-4 self-start"
          hitSlop={8}
          onPress={() => {
            hapticLight();
            onOpenWebReport();
          }}
        >
          <Text className="text-sm font-semibold text-brand">Open full report</Text>
        </AnimatedPressable>
      </View>

      <AthleteReportSheet
        visible={sheetOpen}
        report={completedReport}
        onClose={() => setSheetOpen(false)}
        onOpenWeb={() => {
          setSheetOpen(false);
          onOpenWebReport();
        }}
      />
    </View>
  );
}

/** Lead Max HR + secondary resting/LTHR — breaks the equal three-tile grid. */
function HrMetrics({
  maxHr,
  restingHr,
  lthr,
}: {
  maxHr: number | null;
  restingHr: number | null;
  lthr: number | null;
}) {
  return (
    <View className="mt-5 flex-row items-end gap-5 border-b border-border/80 pb-4">
      <View className="min-w-0 flex-[1.35]">
        <Text className="text-xs uppercase tracking-wide text-text-muted">Max HR</Text>
        <View className="mt-1 flex-row items-baseline gap-1.5">
          <Text className="text-3xl font-semibold text-text-primary">
            {maxHr != null ? Math.round(maxHr) : '—'}
          </Text>
          {maxHr != null ? <Text className="text-sm text-text-muted">bpm</Text> : null}
        </View>
      </View>
      <View className="min-w-0 flex-1 gap-2.5">
        <HrSecondary label="Resting" value={restingHr} />
        <HrSecondary label="LTHR" value={lthr} />
      </View>
    </View>
  );
}

function HrSecondary({ label, value }: { label: string; value: number | null }) {
  return (
    <View className="flex-row items-baseline justify-between gap-2">
      <Text className="text-xs text-text-muted">{label}</Text>
      <Text className="text-base font-semibold text-text-primary">
        {value != null ? `${Math.round(value)} bpm` : '—'}
      </Text>
    </View>
  );
}
