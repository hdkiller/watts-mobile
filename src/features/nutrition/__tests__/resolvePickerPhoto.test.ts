import { describe, expect, it, vi } from 'vitest';

import { resolvePickerPhoto } from '../resolvePickerPhoto';

describe('resolvePickerPhoto', () => {
  it('uses picker base64 when present', async () => {
    const readBase64 = vi.fn();
    await expect(
      resolvePickerPhoto(
        {
          uri: 'file:///tmp/meal.jpg',
          base64: 'abc123',
          mimeType: 'image/jpeg',
        },
        readBase64
      )
    ).resolves.toEqual({
      uri: 'file:///tmp/meal.jpg',
      base64: 'abc123',
      mimeType: 'image/jpeg',
    });
    expect(readBase64).not.toHaveBeenCalled();
  });

  it('reads base64 from uri when picker omits it', async () => {
    const readBase64 = vi.fn().mockResolvedValue('from-file');
    await expect(
      resolvePickerPhoto(
        {
          uri: 'file:///tmp/meal.jpg',
          base64: null,
          mimeType: 'image/png',
        },
        readBase64
      )
    ).resolves.toEqual({
      uri: 'file:///tmp/meal.jpg',
      base64: 'from-file',
      mimeType: 'image/png',
    });
    expect(readBase64).toHaveBeenCalledWith('file:///tmp/meal.jpg');
  });

  it('returns null when uri is missing', async () => {
    await expect(
      resolvePickerPhoto({ uri: '', base64: 'abc' }, vi.fn())
    ).resolves.toBeNull();
  });

  it('returns null when file read fails and base64 is absent', async () => {
    const readBase64 = vi.fn().mockRejectedValue(new Error('missing'));
    await expect(
      resolvePickerPhoto({ uri: 'file:///tmp/gone.jpg', base64: null }, readBase64)
    ).resolves.toBeNull();
  });

  it('defaults mime type to image/jpeg', async () => {
    await expect(
      resolvePickerPhoto(
        { uri: 'file:///tmp/meal.jpg', base64: 'abc' },
        vi.fn()
      )
    ).resolves.toMatchObject({ mimeType: 'image/jpeg' });
  });
});
