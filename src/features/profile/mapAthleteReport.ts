export type AthleteScoreChip = {
  key: string;
  label: string;
  score: number;
};

export type AthleteProfileReport = {
  id: string;
  status: string;
  executiveSummary: string | null;
  fitnessStatusLabel: string | null;
  recommendationsSummary: string | null;
  scores: AthleteScoreChip[];
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

const SCORE_LABELS: Record<string, string> = {
  current_fitness: 'Fitness',
  recovery_capacity: 'Recovery',
  nutrition_compliance: 'Nutrition',
  training_consistency: 'Consistency',
  hr_power_alignment: 'HR/Power',
};

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
  const recommendationsSummary =
    typeof analysis?.recommendations_summary === 'string'
      ? analysis.recommendations_summary.trim()
      : null;

  return {
    id: root.id,
    status: typeof root.status === 'string' ? root.status : 'UNKNOWN',
    executiveSummary:
      typeof analysis?.executive_summary === 'string' && analysis.executive_summary.trim()
        ? analysis.executive_summary.trim()
        : null,
    fitnessStatusLabel:
      typeof fitness?.status_label === 'string' && fitness.status_label.trim()
        ? fitness.status_label.trim()
        : typeof fitness?.status === 'string'
          ? fitness.status
          : null,
    recommendationsSummary: recommendationsSummary || null,
    scores,
    createdAt: typeof root.createdAt === 'string' ? root.createdAt : null,
  };
}
