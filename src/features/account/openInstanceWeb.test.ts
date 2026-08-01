import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as WebBrowser from 'expo-web-browser';

import { mintAppWebHandoff } from '@/src/features/account/handoffApi';
import { openInstanceWeb } from './openInstanceWeb';

vi.mock('expo-web-browser', () => ({
  openBrowserAsync: vi.fn(),
}));

vi.mock('@/src/features/account/handoffApi', () => ({
  mintAppWebHandoff: vi.fn(),
}));

describe('openInstanceWeb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing and returns false if instanceUrl is null or undefined', async () => {
    await expect(openInstanceWeb(null, '/settings/danger')).resolves.toBe(false);
    await expect(openInstanceWeb(undefined, '/settings/danger')).resolves.toBe(false);
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
    expect(mintAppWebHandoff).not.toHaveBeenCalled();
  });

  it('opens minted URL when origin matches bareUrl origin', async () => {
    vi.mocked(mintAppWebHandoff).mockResolvedValueOnce({
      url: 'https://coachwatts.com/api/auth/handoff?token=valid-token&returnTo=%2Fsettings%2Fdanger',
      expiresIn: 300,
    });

    await expect(openInstanceWeb('https://coachwatts.com', '/settings/danger')).resolves.toBe(true);

    expect(mintAppWebHandoff).toHaveBeenCalledWith('/settings/danger');
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledTimes(1);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://coachwatts.com/api/auth/handoff?token=valid-token&returnTo=%2Fsettings%2Fdanger',
    );
  });

  it('falls back to bareUrl when minted URL has a different origin (same-origin check fails)', async () => {
    vi.mocked(mintAppWebHandoff).mockResolvedValueOnce({
      url: 'https://attacker.com/api/auth/handoff?token=stolen-token',
      expiresIn: 300,
    });

    await openInstanceWeb('https://coachwatts.com', '/settings/danger');

    expect(mintAppWebHandoff).toHaveBeenCalledWith('/settings/danger');
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledTimes(1);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://coachwatts.com/settings/danger',
    );
  });

  it('falls back to bareUrl when mintAppWebHandoff throws an error', async () => {
    vi.mocked(mintAppWebHandoff).mockRejectedValueOnce(new Error('Network error'));

    await openInstanceWeb('https://coachwatts.com', '/settings/danger');

    expect(mintAppWebHandoff).toHaveBeenCalledWith('/settings/danger');
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledTimes(1);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://coachwatts.com/settings/danger',
    );
  });

  it('falls back to bareUrl when minted URL is an invalid URL string', async () => {
    vi.mocked(mintAppWebHandoff).mockResolvedValueOnce({
      url: 'not-a-valid-url',
      expiresIn: 300,
    });

    await openInstanceWeb('https://coachwatts.com', '/settings/danger');

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledTimes(1);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://coachwatts.com/settings/danger',
    );
  });
});
