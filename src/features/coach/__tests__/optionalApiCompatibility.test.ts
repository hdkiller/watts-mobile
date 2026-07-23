import { beforeEach, describe, expect, it, vi } from 'vitest';

import { transcribeChatAudio } from '../api';
import { fetchNutritionSettings } from '../../nutrition/nutritionSettingsApi';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/src/api/client', () => ({ apiFetch }));

describe('optional API compatibility', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    vi.stubGlobal(
      'FormData',
      class MockFormData {
        append() {}
      }
    );
  });

  it('loads nutrition settings with non-destructive auth handling', async () => {
    apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({ settings: {} }), { status: 200 }));

    await fetchNutritionSettings();

    expect(apiFetch).toHaveBeenCalledWith('/api/profile/nutrition', {
      softUnauthorized: true,
    });
  });

  it('transcribes with non-destructive auth handling', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ transcript: 'Ready to train' }), { status: 200 })
    );

    await expect(
      transcribeChatAudio({
        uri: 'file:///dictation.m4a',
        mediaType: 'audio/mp4',
        filename: 'dictation.m4a',
      })
    ).resolves.toBe('Ready to train');

    expect(apiFetch).toHaveBeenCalledWith(
      '/api/chat/transcribe',
      expect.objectContaining({
        method: 'POST',
        softUnauthorized: true,
      })
    );
  });
});
