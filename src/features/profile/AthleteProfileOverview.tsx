import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { ScoreChip } from '@/src/components/ScoreChip';
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
    try {
      await generateAthleteProfile();
      const report = await pollAthleteProfileReport();
      queryClient.setQueryData(ATHLETE_PROFILE_REPORT_KEY, report);
      if (report?.status === 'FAILED') {
        setSyncError('Profile generation failed. Try again or open web.');
      } else if (report?.status !== 'COMPLETED') {
        setSyncError('Still generating. Pull to refresh or open web in a minute.');
      }
    } catch (err) {
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sync athlete profile"
            disabled={syncing}
            onPress={() => void onSync()}
            className="rounded-full border border-border-strong px-3 py-1.5 active:opacity-70"
          >
            {syncing ? (
              <ActivityIndicator color={Colors.brand} size="small" />
            ) : (
              <Text className="text-xs font-semibold text-brand">Sync</Text>
            )}
          </Pressable>
        ) : null}
      </View>

      <View className="mt-4 flex-row gap-2.5">
        <HrTile label="Max HR" value={profile.maxHr} />
        <HrTile label="Resting HR" value={profile.restingHr} />
        <HrTile label="LTHR" value={profile.lthr} />
      </View>

      <View className="mt-5 rounded-xl border border-border bg-card/80 px-4 py-4">
        <Text className="text-xs uppercase tracking-wide text-text-muted">AI Athlete Profile</Text>

        {reportQuery.isLoading && !reportQuery.data ? (
          <ActivityIndicator className="mt-4" color={Colors.brand} />
        ) : reportForbidden ? (
          <View className="mt-3">
            <Text className="text-sm text-text-muted">
              New permissions are available for AI reports — a quick access update unlocks them.
            </Text>
            <Pressable className="mt-3 active:opacity-70" onPress={onReauth}>
              <Text className="text-sm font-semibold text-brand">Update access</Text>
            </Pressable>
            <Pressable className="mt-3 active:opacity-70" onPress={onOpenWebReport}>
              <Text className="text-sm font-semibold text-text-body">
                Open web Athlete Profile
              </Text>
            </Pressable>
          </View>
        ) : reportQuery.isError ? (
          <View className="mt-3">
            <Text className="text-sm text-red-400">
              {friendlyError(reportQuery.error, 'Could not load AI profile')}
            </Text>
            <Pressable
              className="mt-3 active:opacity-70"
              onPress={() => void reportQuery.refetch()}
            >
              <Text className="text-sm font-semibold text-brand">Retry</Text>
            </Pressable>
          </View>
        ) : reportQuery.data?.status === 'PENDING' ||
          reportQuery.data?.status === 'PROCESSING' ? (
          <Text className="mt-3 text-sm text-text-muted">Generating your athlete profile…</Text>
        ) : completedReport?.executiveSummary ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View AI athlete profile report"
            disabled={!canOpenLiteSheet}
            onPress={() => setSheetOpen(true)}
            className="mt-3 active:opacity-90"
          >
            {completedReport.fitnessStatusLabel ? (
              <Text className="mb-2 text-xs font-semibold text-brand">
                {completedReport.fitnessStatusLabel}
              </Text>
            ) : null}
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
          </Pressable>
        ) : (
          <View className="mt-3">
            <Text className="text-sm text-text-muted">
              No AI athlete profile yet. Sync to generate one, or open the web report.
            </Text>
          </View>
        )}

        {syncError ? <Text className="mt-3 text-sm text-red-400">{syncError}</Text> : null}

        <Pressable className="mt-4 active:opacity-70" onPress={onOpenWebReport}>
          <Text className="text-sm font-semibold text-brand">Open full report on web</Text>
        </Pressable>
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

function HrTile({ label, value }: { label: string; value: number | null }) {
  return (
    <View className="flex-1 rounded-xl border border-border bg-card px-3 py-3">
      <Text className="text-[10px] font-bold uppercase tracking-wide text-text-muted">{label}</Text>
      <View className="mt-2 flex-row items-baseline gap-1">
        <Text className="text-lg font-black text-text-primary">
          {value != null ? Math.round(value) : '—'}
        </Text>
        {value != null ? (
          <Text className="text-[10px] font-semibold text-text-muted">bpm</Text>
        ) : null}
      </View>
    </View>
  );
}
