/**
 * Sport-type normalization across HealthKit / Health Connect numeric enums,
 * human-readable labels, and FIT sport codes.
 */

export type CanonicalSport =
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'walking'
  | 'hiking'
  | 'rowing'
  | 'elliptical'
  | 'strength'
  | 'yoga'
  | 'pilates'
  | 'hiit'
  | 'cross_training';

/** HKWorkoutActivityType raw values (per @kingstinct/react-native-healthkit). */
const HEALTHKIT_SPORTS: Record<number, CanonicalSport> = {
  11: 'cross_training',
  13: 'cycling',
  16: 'elliptical',
  20: 'strength', // functionalStrengthTraining
  24: 'hiking',
  35: 'rowing',
  37: 'running',
  46: 'swimming',
  50: 'strength', // traditionalStrengthTraining
  52: 'walking',
  57: 'yoga',
  63: 'hiit',
  66: 'pilates',
};

/** ExerciseType constants (per react-native-health-connect). */
const HEALTH_CONNECT_SPORTS: Record<number, CanonicalSport> = {
  8: 'cycling',
  9: 'cycling', // stationary
  13: 'strength', // calisthenics
  25: 'elliptical',
  36: 'hiit',
  37: 'hiking',
  48: 'pilates',
  53: 'rowing',
  54: 'rowing', // machine
  56: 'running',
  57: 'running', // treadmill
  70: 'strength',
  73: 'swimming', // open water
  74: 'swimming', // pool
  79: 'walking',
  81: 'strength', // weightlifting
  83: 'yoga',
};

const SPORT_LABELS: Record<CanonicalSport, string> = {
  running: 'Running',
  cycling: 'Cycling',
  swimming: 'Swimming',
  walking: 'Walking',
  hiking: 'Hiking',
  rowing: 'Rowing',
  elliptical: 'Elliptical',
  strength: 'Strength',
  yoga: 'Yoga',
  pilates: 'Pilates',
  hiit: 'HIIT',
  cross_training: 'Cross training',
};

/** FIT sport enum (generic=0, training=10, fitness_equipment=4). */
const FIT_SPORT_CODES: Record<CanonicalSport, number> = {
  running: 1,
  cycling: 2,
  swimming: 5,
  walking: 11,
  hiking: 17,
  rowing: 15,
  elliptical: 4,
  strength: 10,
  yoga: 10,
  pilates: 10,
  hiit: 10,
  cross_training: 10,
};

export function canonicalSportFromHealthKit(code?: number): CanonicalSport | undefined {
  return code != null ? HEALTHKIT_SPORTS[code] : undefined;
}

export function canonicalSportFromHealthConnect(code?: number): CanonicalSport | undefined {
  return code != null ? HEALTH_CONNECT_SPORTS[code] : undefined;
}

function isCanonicalSport(s: string): s is CanonicalSport {
  return s in SPORT_LABELS;
}

/** Human label for a canonical sport; undefined for raw/unknown values. */
export function sportLabel(sport?: string): string | undefined {
  if (!sport) return undefined;
  return isCanonicalSport(sport) ? SPORT_LABELS[sport] : undefined;
}

/** FIT sport code — canonical names first, then loose keyword fallback. */
export function fitSportCode(sportType?: string): number {
  if (!sportType) return 0; // generic
  if (isCanonicalSport(sportType)) return FIT_SPORT_CODES[sportType];
  const s = sportType.toLowerCase();
  if (s.includes('run')) return 1;
  if (s.includes('cycl') || s.includes('bik')) return 2;
  if (s.includes('swim')) return 5;
  if (s.includes('walk')) return 11;
  if (s.includes('hik')) return 17;
  if (s.includes('row')) return 15;
  return 0;
}
