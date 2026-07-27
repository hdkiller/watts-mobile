import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteAthleteAccount, fetchAthleteProfile, patchAthleteMetrics } from '../api';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/src/api/client', () => ({ apiFetch }));

describe('profile api', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  it('fetches athlete profile', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          profile: {
            name: 'Athlete',
            email: 'athlete@example.com',
            weight: 70,
            weightUnits: 'Kilograms',
            distanceUnits: 'Kilometers',
            temperatureUnits: 'Celsius',
          },
        }),
        { status: 200 },
      ),
    );

    const profile = await fetchAthleteProfile();

    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(profile.name).toBe('Athlete');
    expect(profile.email).toBe('athlete@example.com');
  });

  it('patches athlete metrics', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          profile: {
            name: 'Athlete',
            weight: 75,
            weightUnits: 'Kilograms',
            ftp: 260,
          },
        }),
        { status: 200 },
      ),
    );

    const profile = await patchAthleteMetrics({ ftp: 260 });

    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ftp: 260 }),
    });
    expect(profile.ftp).toBe(260);
  });

  it('triggers deleteAthleteAccount via DELETE /api/profile', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    await expect(deleteAthleteAccount()).resolves.toBeUndefined();

    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith('/api/profile', {
      method: 'DELETE',
    });
  });

  it('handles deleteAthleteAccount failure', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Deletion failed' }), { status: 500 }),
    );

    await expect(deleteAthleteAccount()).rejects.toThrow('Deletion failed');
  });
});
