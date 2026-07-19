export type SportProfile = {
  id: string;
  name: string | null;
  isDefault: boolean;
  types: string[];
  ftp: number | null;
  lthr: number | null;
  maxHr: number | null;
  /** Present when the profile already has a pace threshold. */
  thresholdPace: number | null;
  /** Full API row for round-trip PATCH (avoid wiping advanced fields). */
  raw: Record<string, unknown>;
};

export type SportThresholdFormValues = {
  ftp: string;
  lthr: string;
  maxHr: string;
  thresholdPace: string;
};

export type SportThresholdPatch = {
  ftp?: number | null;
  lthr?: number | null;
  maxHr?: number | null;
  thresholdPace?: number | null;
};
