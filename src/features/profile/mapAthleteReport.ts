export type AthleteScoreChip = {
  key: string;
  label: string;
  score: number;
};

export type AthleteReportSectionKind =
  | 'fitness'
  | 'training'
  | 'recovery'
  | 'nutrition'
  | 'recent'
  | 'recommendations';

export type AthleteReportBadgeTone = 'success' | 'recovery' | 'modify' | 'muted';

export type AthleteReportBadge = {
  label: string;
  tone: AthleteReportBadgeTone;
};

export type AthleteReportField = {
  label: string;
  value: string;
};

export type AthleteReportSection = {
  key: string;
  kind: AthleteReportSectionKind;
  title: string;
  body: string;
  badge: AthleteReportBadge | null;
  fields: AthleteReportField[];
  strengths: string[];
  development: string[];
  bullets: string[];
};

export type AthleteProfileReport = {
  id: string;
  status: string;
  executiveSummary: string | null;
  fitnessStatusLabel: string | null;
  /** Short styled chip for fitness status (Developing, Declining, …). */
  fitnessStatusBadge: AthleteReportBadge | null;
  recommendationsSummary: string | null;
  scores: AthleteScoreChip[];
  sections: AthleteReportSection[];
  createdAt: string | null;
};

const FITNESS_STATUS_KEYS = new Set([
  'excellent',
  'good',
  'moderate',
  'developing',
  'recovering',
]);

const TREND_STATUS_KEYS = new Set(['improving', 'stable', 'declining', 'variable']);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter((item): item is string => item != null);
}

function fieldsFrom(
  obj: Record<string, unknown>,
  entries: { key: string; label: string }[]
): AthleteReportField[] {
  const fields: AthleteReportField[] = [];
  for (const entry of entries) {
    const value = asString(obj[entry.key]);
    if (value) fields.push({ label: entry.label, value });
  }
  return fields;
}

function notableWorkoutBullets(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const bullets: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const text = asString(item);
      if (text) bullets.push(text);
      continue;
    }
    const row = asRecord(item);
    if (!row) continue;
    const title = asString(row.title);
    const insight = asString(row.key_insight);
    const date = asString(row.date);
    if (title && insight) {
      bullets.push(date ? `${title} (${date}): ${insight}` : `${title}: ${insight}`);
    } else if (insight) {
      bullets.push(insight);
    } else if (title) {
      bullets.push(title);
    }
  }
  return bullets;
}

function actionItemBullets(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const bullets: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const text = asString(item);
      if (text) bullets.push(text);
      continue;
    }
    const row = asRecord(item);
    if (!row) continue;
    const action = asString(row.action);
    if (action) bullets.push(action);
  }
  return bullets;
}

/** Maps fitness status / performance trend enums to companion badge tones (web parity). */
export function badgeToneForStatus(status: string | null | undefined): AthleteReportBadgeTone {
  const key = (status ?? '').trim().toLowerCase();
  switch (key) {
    case 'excellent':
    case 'good':
    case 'improving':
      return 'success';
    case 'moderate':
    case 'developing':
    case 'stable':
      return 'recovery';
    case 'recovering':
    case 'declining':
      return 'modify';
    case 'variable':
    default:
      return key ? 'muted' : 'muted';
  }
}

function displayLabel(raw: string): string {
  if (raw !== raw.toLowerCase()) return raw;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function makeBadge(label: string | null, statusKey: string | null): AthleteReportBadge | null {
  const chip = statusKey || label;
  if (!chip) return null;
  // Prefer the short enum for the chip ("Developing") when the API also sends a longer status_label.
  const knownKey = statusKey && (FITNESS_STATUS_KEYS.has(statusKey.toLowerCase()) || TREND_STATUS_KEYS.has(statusKey.toLowerCase()))
    ? statusKey
    : chip;
  return { label: displayLabel(knownKey), tone: badgeToneForStatus(statusKey || label) };
}

function sectionHasContent(section: Omit<AthleteReportSection, 'key' | 'kind' | 'title'>): boolean {
  return (
    section.body.length > 0 ||
    section.fields.length > 0 ||
    section.strengths.length > 0 ||
    section.development.length > 0 ||
    section.bullets.length > 0 ||
    section.badge != null
  );
}

const SCORE_LABELS: Record<string, string> = {
  current_fitness: 'Fitness',
  recovery_capacity: 'Recovery',
  nutrition_compliance: 'Nutrition',
  training_consistency: 'Consistency',
  hr_power_alignment: 'HR/Power',
};

function emptySectionParts(): Omit<AthleteReportSection, 'key' | 'kind' | 'title'> {
  return {
    body: '',
    badge: null,
    fields: [],
    strengths: [],
    development: [],
    bullets: [],
  };
}

export function mapAthleteProfileReport(json: unknown): AthleteProfileReport | null {
  const root = asRecord(json);
  if (!root || typeof root.id !== 'string') return null;

  const analysis = asRecord(root.analysisJson);
  const scoresRaw = asRecord(analysis?.athlete_scores);
  const scores: AthleteScoreChip[] = [];
  if (scoresRaw) {
    for (const [key, label] of Object.entries(SCORE_LABELS)) {
      const entry = asRecord(scoresRaw[key]);
      const score = asFiniteNumber(entry?.score) ?? asFiniteNumber(scoresRaw[key]);
      if (score != null) {
        scores.push({ key, label, score: Math.round(score) });
      }
    }
  }

  const fitness = asRecord(analysis?.current_fitness);
  const training = asRecord(analysis?.training_characteristics);
  const recovery = asRecord(analysis?.recovery_profile);
  const nutrition = asRecord(analysis?.nutrition_profile);
  const recent = asRecord(analysis?.recent_performance);
  const recommendations = asRecord(analysis?.recommendations_summary);

  const recommendationsSummary =
    asString(analysis?.recommendations_summary) ||
    asString(recommendations?.summary) ||
    null;

  const sections: AthleteReportSection[] = [];

  let fitnessStatusBadge: AthleteReportBadge | null = null;
  if (fitness) {
    const statusKey = asString(fitness.status);
    const statusLabel = asString(fitness.status_label) || statusKey;
    const parts = emptySectionParts();
    parts.badge = makeBadge(statusLabel, statusKey);
    fitnessStatusBadge = parts.badge;
    parts.body = asString(fitness.summary) || asString(fitness.overview) || '';
    parts.bullets = asStringList(fitness.key_points);
    if (sectionHasContent(parts)) {
      sections.push({
        key: 'fitness',
        kind: 'fitness',
        title: 'Current fitness',
        ...parts,
      });
    }
  }

  if (training) {
    const parts = emptySectionParts();
    parts.body = asString(training.training_style) || asString(training.summary) || '';
    parts.strengths = asStringList(training.strengths);
    const developmentRaw = [
      ...asStringList(training.areas_for_development),
      ...asStringList(training.areas_for_improvement),
      ...asStringList(training.improvement_areas),
    ];
    parts.development = [...new Set(developmentRaw)];
    if (sectionHasContent(parts)) {
      sections.push({
        key: 'training',
        kind: 'training',
        title: 'Training characteristics',
        ...parts,
      });
    }
  }

  if (recovery) {
    const parts = emptySectionParts();
    parts.fields = fieldsFrom(recovery, [
      { key: 'recovery_pattern', label: 'Recovery pattern' },
      { key: 'hrv_trend', label: 'HRV trend' },
      { key: 'sleep_quality', label: 'Sleep quality' },
    ]);
    parts.body = asString(recovery.summary) || '';
    parts.bullets = asStringList(recovery.key_observations);
    if (sectionHasContent(parts)) {
      sections.push({
        key: 'recovery',
        kind: 'recovery',
        title: 'Recovery',
        ...parts,
      });
    }
  }

  if (nutrition) {
    const parts = emptySectionParts();
    parts.fields = fieldsFrom(nutrition, [
      { key: 'nutrition_pattern', label: 'Nutrition pattern' },
      { key: 'caloric_balance', label: 'Caloric balance' },
      { key: 'macro_distribution', label: 'Macro distribution' },
    ]);
    parts.body = asString(nutrition.summary) || '';
    parts.bullets = asStringList(nutrition.key_observations);
    if (sectionHasContent(parts)) {
      sections.push({
        key: 'nutrition',
        kind: 'nutrition',
        title: 'Nutrition',
        ...parts,
      });
    }
  }

  if (recent) {
    const trendKey = asString(recent.trend);
    const parts = emptySectionParts();
    parts.badge = makeBadge(trendKey, trendKey);
    parts.body = asString(recent.summary) || '';
    parts.bullets = [
      ...asStringList(recent.patterns),
      ...notableWorkoutBullets(recent.notable_workouts),
    ];
    if (sectionHasContent(parts)) {
      sections.push({
        key: 'recent',
        kind: 'recent',
        title: 'Recent performance',
        ...parts,
      });
    }
  }

  if (recommendations) {
    const parts = emptySectionParts();
    parts.body = asString(recommendations.summary) || '';
    parts.bullets = [
      ...asStringList(recommendations.recurring_themes),
      ...actionItemBullets(recommendations.action_items),
    ];
    if (sectionHasContent(parts)) {
      sections.push({
        key: 'recommendations',
        kind: 'recommendations',
        title: 'Recommendations',
        ...parts,
      });
    }
  } else if (recommendationsSummary) {
    sections.push({
      key: 'recommendations',
      kind: 'recommendations',
      title: 'Recommendations',
      body: recommendationsSummary,
      badge: null,
      fields: [],
      strengths: [],
      development: [],
      bullets: [],
    });
  }

  return {
    id: root.id,
    status: typeof root.status === 'string' ? root.status : 'UNKNOWN',
    executiveSummary: asString(analysis?.executive_summary),
    fitnessStatusLabel:
      asString(fitness?.status_label) || asString(fitness?.status),
    fitnessStatusBadge,
    recommendationsSummary,
    scores,
    sections,
    createdAt: typeof root.createdAt === 'string' ? root.createdAt : null,
  };
}
