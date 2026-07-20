import { describe, expect, it } from 'vitest';

import type { RecoveryContextItem } from '@/src/features/recovery/types';
import type { TodayViewModel } from '@/src/features/today/types';

import {
  buildCoachSeedContext,
  buildSessionCoachSeedContext,
  displayAthleteText,
  withSeedPrefix,
} from '../seedContext';

const baseToday = (): TodayViewModel => ({
  recommendationId: 'rec-1',
  action: 'proceed',
  actionLabel: 'Proceed as planned',
  rationale: 'Sleep and readiness look solid for the planned work.',
  confidence: 0.8,
  status: 'ready',
  userAccepted: false,
  canAccept: false,
  modificationSummary: null,
  plannedWorkout: {
    id: 'pw-1',
    title: 'Tempo ride',
    type: 'bike',
    date: '2026-07-19',
    durationSec: 3600,
    tss: 70,
    description: null,
    structureSummary: null,
  },
  recovery: {
    sleepLabel: '7.5h',
    hrvLabel: 'green',
    feelLabel: '8',
    sleepSentiment: null,
    hrvSentiment: 'good',
    feelSentiment: 'good',
  },
  raw: null,
});

describe('buildCoachSeedContext', () => {
  it('returns null when nothing useful is cached', () => {
    expect(buildCoachSeedContext({})).toBeNull();
  });

  it('builds a short non-prescriptive seed from Today + recovery', () => {
    const recovery: RecoveryContextItem[] = [
      {
        id: 'r1',
        sourceRecordId: 'j1',
        kind: 'journey_event',
        sourceType: 'manual_event',
        label: 'Fatigue',
        description: null,
        severity: 4,
        startAt: '2026-07-19T08:00:00.000Z',
        endAt: '2026-07-19T08:00:00.000Z',
        editable: true,
        deletable: true,
        origin: 'manual',
        category: 'FATIGUE',
      },
    ];

    const seed = buildCoachSeedContext({ today: baseToday(), activeRecovery: recovery });
    expect(seed).toContain("Today's recommendation: Proceed as planned.");
    expect(seed).toContain('Planned session: Tempo ride · bike.');
    expect(seed).toContain('Recovery strip: sleep 7.5h, HRV green, feel 8.');
    expect(seed).toContain('Active recovery notes: Fatigue (4/10).');
    expect(seed).toContain('do not invent a new plan');
    expect(seed).not.toContain('You should rest');
  });

  it('prefixes the athlete question once', () => {
    expect(withSeedPrefix('Why this?', 'Context line')).toBe(
      'Context line\n\nAthlete question: Why this?'
    );
    expect(withSeedPrefix('Why this?', null)).toBe('Why this?');
  });
});

describe('buildSessionCoachSeedContext', () => {
  it('builds identity-focused seed without inventing prescriptions', () => {
    const seed = buildSessionCoachSeedContext({
      kind: 'activity',
      id: 'w1',
      title: 'Lunch ride',
      type: 'Ride',
      date: '2026-07-20',
      metricsLine: '90 min · TSS 85',
      adherenceLine: '82% — Solid tempo execution',
    });
    expect(seed).toContain('Completed activity: Lunch ride · Ride.');
    expect(seed).toContain('Date: 2026-07-20.');
    expect(seed).toContain('Key metrics: 90 min · TSS 85');
    expect(seed).toContain('Plan adherence: 82% — Solid tempo execution');
    expect(seed).toContain('do not invent a new plan');
    expect(seed).not.toContain('You should');
  });

  it('returns null without a title', () => {
    expect(
      buildSessionCoachSeedContext({
        kind: 'planned',
        id: 'pw-1',
        title: '   ',
      })
    ).toBeNull();
  });
});

describe('displayAthleteText', () => {
  it('strips the seed block and keeps the athlete question', () => {
    const seeded = withSeedPrefix(
      "What's the intent of today's planned session?",
      buildCoachSeedContext({ today: baseToday() })
    );
    expect(displayAthleteText(seeded)).toBe("What's the intent of today's planned session?");
  });

  it('strips session seed blocks', () => {
    const seeded = withSeedPrefix(
      'What should I focus on?',
      buildSessionCoachSeedContext({
        kind: 'planned',
        id: 'pw-1',
        title: 'Threshold',
        type: 'Ride',
      })
    );
    expect(displayAthleteText(seeded)).toBe('What should I focus on?');
  });

  it('leaves ordinary user text unchanged', () => {
    expect(displayAthleteText('Athlete question: just kidding, real text')).toBe(
      'Athlete question: just kidding, real text'
    );
    expect(displayAthleteText('How hard should I go?')).toBe('How hard should I go?');
  });
});
