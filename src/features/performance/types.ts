export type PmcPoint = {
  date: string;
  ctl: number;
  atl: number;
  tsb: number;
  tss: number;
};

export type PmcSummary = {
  currentCTL: number;
  currentATL: number;
  currentTSB: number;
  avgTSS: number | null;
  formStatus: string;
  formColor: string;
  formDescription: string;
  lastUpdated: string | null;
};

export type PmcPayload = {
  data: PmcPoint[];
  summary: PmcSummary;
};

export type PmcPeriodDays = 30 | 60 | 90;
