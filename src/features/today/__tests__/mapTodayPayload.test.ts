import { describe, expect, it } from 'vitest';

import {
  confidenceBucket,
  confidenceFilledCount,
  formatDuration,
  heroToneForAction,
  mapTodayPayload,
  normalizeConfidence,
} from '../mapTodayPayload';
import type { ActivityRecommendationApi } from '../types';

describe('heroToneForAction', () => {
  it('maps known actions to train, rest, or modify', () => {
    expect(heroToneForAction('proceed')).toBe('train');
    expect(heroToneForAction('train')).toBe('train');
    expect(heroToneForAction('rest')).toBe('rest');
    expect(heroToneForAction('modify')).toBe('modify');
    expect(heroToneForAction('reduce_intensity')).toBe('modify');
  });

  it('falls back to train for unknown or empty actions', () => {
    expect(heroToneForAction(null)).toBe('train');
    expect(heroToneForAction(undefined)).toBe('train');
    expect(heroToneForAction('')).toBe('train');
    expect(heroToneForAction('surprise_me')).toBe('train');
  });
});

describe('confidence helpers', () => {
  it('normalizes unit and percent confidence', () => {
    expect(normalizeConfidence(null)).toBeNull();
    expect(normalizeConfidence(0.82)).toBe(0.82);
    expect(normalizeConfidence(85)).toBe(0.85);
    expect(normalizeConfidence(0)).toBe(0);
    expect(normalizeConfidence(100)).toBe(1);
  });

  it('buckets confidence for the three-dot indicator', () => {
    expect(confidenceBucket(null)).toBeNull();
    expect(confidenceBucket(0.2)).toBe('low');
    expect(confidenceBucket(0.44)).toBe('low');
    expect(confidenceBucket(0.45)).toBe('medium');
    expect(confidenceBucket(0.74)).toBe('medium');
    expect(confidenceBucket(0.75)).toBe('high');
    expect(confidenceBucket(85)).toBe('high');
  });

  it('maps buckets to filled-dot counts', () => {
    expect(confidenceFilledCount(null)).toBeNull();
    expect(confidenceFilledCount(0.3)).toBe(1);
    expect(confidenceFilledCount(0.5)).toBe(2);
    expect(confidenceFilledCount(0.9)).toBe(3);
  });
});

describe('mapTodayPayload', () => {
  it('maps null to an empty today view', () => {
    const view = mapTodayPayload(null);
    expect(view.recommendationId).toBeNull();
    expect(view.canAccept).toBe(false);
    expect(view.actionLabel).toBe('No recommendation yet');
  });

  it('maps a pending recommendation with modifications as acceptable', () => {
    const raw: ActivityRecommendationApi = {
      id: 'rec-1',
      recommendation: 'modify',
      reasoning: 'Legs need freshness',
      confidence: 0.82,
      userAccepted: false,
      analysisJson: {
        suggested_modifications: {
          description: 'Cut intervals by 20%',
          new_type: 'Ride',
        },
        recovery_context: {
          sleepScore: 78,
          hrv: 62,
          readiness: 7,
        },
      },
      plannedWorkout: {
        id: 'pw-1',
        title: 'Sweet Spot',
        type: 'Ride',
        durationSec: 5400,
        tss: 85,
        structure: { steps: [{}, {}, {}] },
      },
    };

    const view = mapTodayPayload(raw);
    expect(view.recommendationId).toBe('rec-1');
    expect(view.actionLabel).toBe('Modify workout');
    expect(view.canAccept).toBe(true);
    expect(view.modificationSummary).toBe('Cut intervals by 20%');
    expect(view.plannedWorkout?.title).toBe('Sweet Spot');
    expect(view.plannedWorkout?.structureSummary).toBe('3 structured steps');
    expect(view.recovery.sleepLabel).toBe('78');
    expect(view.recovery.hrvLabel).toBe('62');
    expect(view.recovery.feelLabel).toBe('7');
  });

  it('disables accept when already accepted', () => {
    const view = mapTodayPayload({
      id: 'rec-2',
      recommendation: 'proceed',
      userAccepted: true,
      analysisJson: {
        suggested_modifications: { description: 'Keep as planned' },
      },
    });
    expect(view.canAccept).toBe(false);
    expect(view.userAccepted).toBe(true);
  });
});

describe('formatDuration', () => {
  it('formats minutes and hours', () => {
    expect(formatDuration(null)).toBeNull();
    expect(formatDuration(1800)).toBe('30 min');
    expect(formatDuration(5400)).toBe('1h 30m');
    expect(formatDuration(7200)).toBe('2h');
  });
});
