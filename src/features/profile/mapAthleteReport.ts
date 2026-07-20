export type AthleteScoreChip = {
  key: string;
  label: string;
  score: number;
};

export type AthleteReportSection = {
  key: string;
  title: string;
  body: string;
  bullets: string[];
};

export type AthleteProfileReport = {
  id: string;
  status: string;
  executiveSummary: string | null;
  fitnessStatusLabel: string | null;
  recommendationsSummary: string | null;
  scores: AthleteScoreChip[];
  sections: AthleteReportSection[];
  createdAt: string | null;
};

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

const SCORE_LABELS: Record<string, string> = {
  current_fitness: 'Fitness',
  recovery_capacity: 'Recovery',
  nutrition_compliance: 'Nutrition',
  training_consistency: 'Consistency',
  hr_power_alignment: 'HR/Power',
};

function sectionFromObject(
  key: string,
  title: string,
  obj: Record<string, unknown> | null,
  textKeys: string[],
  listKeys: string[]
): AthleteReportSection | null {
  if (!obj) return null;
  const parts = textKeys.map((k) => asString(obj[k])).filter((v): v is string => v != null);
  const bullets = listKeys.flatMap((k) => asStringList(obj[k]));
  if (parts.length === 0 && bullets.length === 0) return null;
  return {
    key,
    title,
    body: parts.join('\n\n'),
    bullets,
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
  const fitnessSection = sectionFromObject(
    'fitness',
    'Current fitness',
    fitness,
    ['status_label', 'status', 'summary', 'overview'],
    ['key_points']
  );
  if (fitnessSection) sections.push(fitnessSection);

  const trainingSection = sectionFromObject(
    'training',
    'Training characteristics',
    training,
    ['training_style', 'summary'],
    ['strengths', 'areas_for_improvement', 'improvement_areas']
  );
  if (trainingSection) sections.push(trainingSection);

  const recoverySection = sectionFromObject(
    'recovery',
    'Recovery',
    recovery,
    ['recovery_pattern', 'hrv_trend', 'sleep_quality', 'summary'],
    ['key_observations']
  );
  if (recoverySection) sections.push(recoverySection);

  const nutritionSection = sectionFromObject(
    'nutrition',
    'Nutrition',
    nutrition,
    ['nutrition_pattern', 'caloric_balance', 'macro_distribution', 'summary'],
    ['key_observations']
  );
  if (nutritionSection) sections.push(nutritionSection);

  const recentSection = sectionFromObject(
    'recent',
    'Recent performance',
    recent,
    ['trend', 'summary'],
    ['patterns', 'notable_workouts']
  );
  if (recentSection) sections.push(recentSection);

  if (recommendations) {
    const recSection = sectionFromObject(
      'recommendations',
      'Recommendations',
      recommendations,
      ['summary'],
      ['recurring_themes', 'action_items']
    );
    if (recSection) sections.push(recSection);
  } else if (recommendationsSummary) {
    sections.push({
      key: 'recommendations',
      title: 'Recommendations',
      body: recommendationsSummary,
      bullets: [],
    });
  }

  return {
    id: root.id,
    status: typeof root.status === 'string' ? root.status : 'UNKNOWN',
    executiveSummary: asString(analysis?.executive_summary),
    fitnessStatusLabel:
      asString(fitness?.status_label) || asString(fitness?.status),
    recommendationsSummary,
    scores,
    sections,
    createdAt: typeof root.createdAt === 'string' ? root.createdAt : null,
  };
}
