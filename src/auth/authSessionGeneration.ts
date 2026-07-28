/**
 * Monotonic generation for the local auth session.
 *
 * Bumped when tokens are intentionally replaced (sign-in / sign-out / instance switch)
 * so in-flight 401 → refresh → failAuthSession paths from a prior session cannot clear
 * or overwrite the new tokens (classic "signed in, instantly kicked out" race).
 */
let authSessionGeneration = 0;

export function getAuthSessionGeneration(): number {
  return authSessionGeneration;
}

export function bumpAuthSessionGeneration(): number {
  authSessionGeneration += 1;
  return authSessionGeneration;
}

/** Test-only reset. */
export function resetAuthSessionGenerationForTests(): void {
  authSessionGeneration = 0;
}
