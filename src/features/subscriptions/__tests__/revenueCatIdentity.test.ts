import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/config/env', () => ({
  REVENUECAT_IOS_API_KEY: 'test_ios_key',
  REVENUECAT_ANDROID_API_KEY: 'test_android_key',
  SUBSCRIPTION_PRO_PRODUCT_IDS: ['coachwatts_pro_monthly'],
  SUBSCRIPTION_SUPPORTER_PRODUCT_IDS: [],
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const isConfigured = vi.fn();
const configure = vi.fn();
const logIn = vi.fn();
const logOut = vi.fn();
const getOfferings = vi.fn();
const purchasePackage = vi.fn();
const restorePurchases = vi.fn();

vi.mock('react-native-purchases', () => ({
  default: {
    isConfigured: (...args: unknown[]) => isConfigured(...args),
    configure: (...args: unknown[]) => configure(...args),
    logIn: (...args: unknown[]) => logIn(...args),
    logOut: (...args: unknown[]) => logOut(...args),
    getOfferings: (...args: unknown[]) => getOfferings(...args),
    purchasePackage: (...args: unknown[]) => purchasePackage(...args),
    restorePurchases: (...args: unknown[]) => restorePurchases(...args),
    setLogLevel: vi.fn(),
    setLogHandler: vi.fn(),
  },
  LOG_LEVEL: { WARN: 'WARN', ERROR: 'ERROR' },
  PRORATION_MODE: { IMMEDIATE_WITH_TIME_PRORATION: 'IMMEDIATE_WITH_TIME_PRORATION' },
  PURCHASES_ERROR_CODE: {
    PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
    PAYMENT_PENDING_ERROR: 'PAYMENT_PENDING_ERROR',
  },
}));

const fakePackage = {
  identifier: 'pkg_monthly',
  product: {
    identifier: 'coachwatts_pro_monthly',
    price: 9.99,
    priceString: '$9.99',
    currencyCode: 'USD',
    title: 'Pro Monthly',
    introPrice: null,
  },
  packageType: 'MONTHLY',
} as never;

/** Fresh module instance per test — `revenueCat.ts` holds module-level identity state. */
async function loadModule() {
  vi.resetModules();
  return import('../revenueCat');
}

beforeEach(() => {
  vi.clearAllMocks();
  isConfigured.mockResolvedValue(false);
  logIn.mockResolvedValue(undefined);
  logOut.mockResolvedValue(undefined);
});

describe('fetchStorePackages — identity gating', () => {
  it('returns [] and never configures the SDK when no identity has been synchronized', async () => {
    const { fetchStorePackages } = await loadModule();
    const result = await fetchStorePackages();
    expect(result).toEqual([]);
    expect(configure).not.toHaveBeenCalled();
    expect(getOfferings).not.toHaveBeenCalled();
  });

  it('fetches offerings once a real identity is configured', async () => {
    const { fetchStorePackages, synchronizeRevenueCatIdentity } = await loadModule();
    getOfferings.mockResolvedValue({ current: { availablePackages: [fakePackage] } });

    await synchronizeRevenueCatIdentity('athlete-123');
    const result = await fetchStorePackages();

    expect(configure).toHaveBeenCalledWith({ apiKey: 'test_ios_key', appUserID: 'athlete-123' });
    expect(getOfferings).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
});

describe('purchaseStorePackage / restoreStorePurchases — identity gating', () => {
  it('purchaseStorePackage fails closed when no identity has been synchronized', async () => {
    const { purchaseStorePackage } = await loadModule();
    await expect(purchaseStorePackage({ nativePackage: fakePackage } as never)).rejects.toThrow(
      /still connecting/i,
    );
    expect(purchasePackage).not.toHaveBeenCalled();
  });

  it('restoreStorePurchases fails closed when no identity has been synchronized', async () => {
    const { restoreStorePurchases } = await loadModule();
    await expect(restoreStorePurchases()).rejects.toThrow(/still connecting/i);
    expect(restorePurchases).not.toHaveBeenCalled();
  });

  it('purchaseStorePackage proceeds once identity is configured', async () => {
    const { purchaseStorePackage, synchronizeRevenueCatIdentity } = await loadModule();
    purchasePackage.mockResolvedValue(undefined);

    await synchronizeRevenueCatIdentity('athlete-456');
    const outcome = await purchaseStorePackage({ nativePackage: fakePackage } as never);

    expect(purchasePackage).toHaveBeenCalled();
    expect(outcome).toBe('purchased');
  });

  it('restoreStorePurchases proceeds once identity is configured', async () => {
    const { restoreStorePurchases, synchronizeRevenueCatIdentity } = await loadModule();
    restorePurchases.mockResolvedValue({ entitlements: { active: { pro: {} } } });

    await synchronizeRevenueCatIdentity('athlete-456');
    const found = await restoreStorePurchases();

    expect(restorePurchases).toHaveBeenCalled();
    expect(found).toBe(true);
  });

  it('purchaseStorePackage awaits a still-running identity switch (awaited logOut/logIn branch) before deciding', async () => {
    const { purchaseStorePackage, synchronizeRevenueCatIdentity } = await loadModule();
    // First identity: SDK not yet configured, so this takes the fire-and-forget
    // configure() branch and resolves immediately.
    isConfigured.mockResolvedValueOnce(false);
    await synchronizeRevenueCatIdentity('athlete-old');

    // Second identity switch: SDK already configured, so this takes the
    // awaited logOut()/logIn() branch — the one a purchase call must wait on.
    isConfigured.mockResolvedValue(true);
    purchasePackage.mockResolvedValue(undefined);
    let resolveLogIn: () => void = () => {};
    logIn.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogIn = resolve;
        }),
    );

    const identityPromise = synchronizeRevenueCatIdentity('athlete-new');
    const purchasePromise = purchaseStorePackage({ nativePackage: fakePackage } as never);

    // Give the purchase call a few microtask turns to run ahead if it weren't gated.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(purchasePackage).not.toHaveBeenCalled();

    resolveLogIn();
    await identityPromise;
    const outcome = await purchasePromise;

    expect(purchasePackage).toHaveBeenCalled();
    expect(outcome).toBe('purchased');
  });
});
