export const SESSION_SPORT_OPTIONS = [
  { label: 'Cycling', value: 'Ride' },
  { label: 'Running', value: 'Run' },
  { label: 'Swimming', value: 'Swim' },
  { label: 'Strength', value: 'WeightTraining' },
] as const;

export type SessionSportType = (typeof SESSION_SPORT_OPTIONS)[number]['value'];

export type SessionEditorForm = {
  dateKey: string;
  title: string;
  type: SessionSportType;
  durationMinutes: string;
  tss: string;
  description: string;
};

export type SessionEditorField = 'title' | 'type' | 'durationMinutes' | 'dateKey' | 'tss';

export type SessionEditorValidation =
  | {
      ok: true;
      payload: {
        title: string;
        type: SessionSportType;
        durationSec: number;
        tss: number | null;
        description: string | null;
        dateKey: string;
      };
    }
  | { ok: false; fieldErrors: Partial<Record<SessionEditorField, string>> };

export function emptySessionEditorForm(dateKey: string): SessionEditorForm {
  return {
    dateKey,
    title: '',
    type: 'Ride',
    durationMinutes: '60',
    tss: '',
    description: '',
  };
}

export function sessionEditorFormFromValues(input: {
  dateKey: string;
  title: string;
  type?: string | null;
  durationSec?: number | null;
  tss?: number | null;
  description?: string | null;
}): SessionEditorForm {
  const typeValue = SESSION_SPORT_OPTIONS.some((o) => o.value === input.type)
    ? (input.type as SessionSportType)
    : 'Ride';
  return {
    dateKey: input.dateKey,
    title: input.title ?? '',
    type: typeValue,
    durationMinutes:
      input.durationSec != null && input.durationSec > 0
        ? String(Math.round(input.durationSec / 60))
        : '60',
    tss: input.tss != null && Number.isFinite(input.tss) ? String(Math.round(input.tss)) : '',
    description: input.description ?? '',
  };
}

export function validateSessionEditorForm(form: SessionEditorForm): SessionEditorValidation {
  const fieldErrors: Partial<Record<SessionEditorField, string>> = {};
  const title = form.title.trim();
  if (!title) fieldErrors.title = 'Title is required';
  if (!form.type) fieldErrors.type = 'Activity type is required';
  if (!form.dateKey) fieldErrors.dateKey = 'Day is required';

  const minutes = Number(form.durationMinutes);
  if (!form.durationMinutes.trim() || !Number.isFinite(minutes) || minutes <= 0) {
    fieldErrors.durationMinutes = 'Duration (minutes) is required';
  }

  const tssRaw = form.tss.trim();
  let tss: number | null = null;
  if (tssRaw) {
    const n = Number(tssRaw);
    if (!Number.isFinite(n) || n < 0) {
      fieldErrors.tss = 'TSS must be a number';
    } else {
      tss = Math.round(n);
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const description = form.description.trim();
  return {
    ok: true,
    payload: {
      title,
      type: form.type,
      durationSec: Math.round(minutes * 60),
      tss,
      description: description || null,
      dateKey: form.dateKey,
    },
  };
}
