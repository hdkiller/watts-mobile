export type JobPollOptions = {
  timeoutMs?: number;
  pollMs?: number;
  signal?: AbortSignal;
};

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => resolve(), ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

/**
 * Poll until `isDone` returns true or timeout.
 * Used for plan generation / adapt jobs that complete asynchronously.
 */
export async function pollUntilDone<T>(
  check: () => Promise<{ done: boolean; value?: T }>,
  options: JobPollOptions = {}
): Promise<T | undefined> {
  const timeoutMs = options.timeoutMs ?? 180_000;
  const pollMs = options.pollMs ?? 2_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    const result = await check();
    if (result.done) return result.value;
    await delay(pollMs, options.signal);
  }

  throw new Error('Still working — try again shortly');
}
