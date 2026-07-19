import { describe, expect, it } from 'vitest';

import {
  emptyMeasurementForm,
  fromDisplayValue,
  measurementFormHasContent,
  parseBodyMeasurementsResponse,
  toCreatePayload,
  toDisplayValue,
} from '../mapMeasurements';

describe('mapMeasurements', () => {
  it('requires a numeric value (and custom name when custom)', () => {
    expect(measurementFormHasContent(emptyMeasurementForm())).toBe(false);
    expect(
      measurementFormHasContent({ ...emptyMeasurementForm(), value: '72.5' })
    ).toBe(true);
    expect(
      measurementFormHasContent({
        ...emptyMeasurementForm('custom'),
        value: '30',
        customName: '',
      })
    ).toBe(false);
    expect(
      measurementFormHasContent({
        ...emptyMeasurementForm('custom'),
        value: '30',
        customName: 'Flexed bicep',
      })
    ).toBe(true);
  });

  it('converts lbs display to kg for create payload', () => {
    const payload = toCreatePayload(
      { ...emptyMeasurementForm('weight'), value: '165' },
      { weightUnits: 'Pounds', distanceUnits: 'Miles' }
    );
    expect(payload?.unit).toBe('kg');
    expect(payload?.value).toBeCloseTo(74.84, 1);
    expect(payload?.metricKey).toBe('weight');
  });

  it('converts inches display to cm for length metrics', () => {
    const payload = toCreatePayload(
      { ...emptyMeasurementForm('waist'), value: '32' },
      { weightUnits: 'Pounds', distanceUnits: 'Miles' }
    );
    expect(payload?.unit).toBe('cm');
    expect(payload?.value).toBeCloseTo(81.28, 1);
  });

  it('builds custom metric keys', () => {
    const payload = toCreatePayload(
      {
        ...emptyMeasurementForm('custom'),
        customName: 'Left Bicep!',
        customUnit: 'cm',
        value: '35',
      },
      { weightUnits: 'Kilograms', distanceUnits: 'Kilometers' }
    );
    expect(payload?.metricKey).toBe('custom:left_bicep');
    expect(payload?.displayName).toBe('Left Bicep!');
    expect(payload?.value).toBe(35);
  });

  it('parses list + latest map from API response', () => {
    const snap = parseBodyMeasurementsResponse({
      items: [
        {
          id: '1',
          metricKey: 'waist',
          displayName: null,
          value: 80,
          unit: 'cm',
          recordedAt: '2026-07-20T08:00:00.000Z',
          source: 'manual_measurement',
          notes: null,
        },
      ],
      latestByMetric: {
        waist: {
          id: '1',
          metricKey: 'waist',
          displayName: null,
          value: 80,
          unit: 'cm',
          recordedAt: '2026-07-20T08:00:00.000Z',
          source: 'manual_measurement',
          notes: null,
        },
      },
    });
    expect(snap.items).toHaveLength(1);
    expect(snap.latestByMetric).toHaveLength(1);
    expect(snap.latestByMetric[0]?.metricKey).toBe('waist');
  });

  it('round-trips display conversion for mass', () => {
    const display = toDisplayValue(70, 'weight', 'kg', {
      weightUnits: 'Pounds',
      distanceUnits: 'Miles',
    });
    const back = fromDisplayValue(display, 'weight', 'kg', {
      weightUnits: 'Pounds',
      distanceUnits: 'Miles',
    });
    expect(back).toBeCloseTo(70, 1);
  });
});
