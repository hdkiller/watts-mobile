import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearSessionDiscuss,
  setSessionDiscuss,
  takeSessionDiscuss,
  type SessionDiscussContext,
} from '../sessionDiscussStore';

describe('sessionDiscussStore', () => {
  beforeEach(() => {
    clearSessionDiscuss();
  });

  it('starts with no pending context', () => {
    expect(takeSessionDiscuss()).toBeNull();
  });

  it('stages context and allows one-shot consumption', () => {
    const context: SessionDiscussContext = {
      kind: 'planned',
      id: 'plan-123',
      title: 'Tempo Ride',
      metricsLine: '60 min · TSS 55',
    };

    setSessionDiscuss(context);

    // First take returns context
    expect(takeSessionDiscuss()).toEqual(context);

    // Second take returns null (consumed)
    expect(takeSessionDiscuss()).toBeNull();
  });

  it('allows clearing staged context without consuming', () => {
    setSessionDiscuss({
      kind: 'activity',
      id: 'act-456',
      title: 'Morning Run',
    });

    clearSessionDiscuss();
    expect(takeSessionDiscuss()).toBeNull();
  });
});
