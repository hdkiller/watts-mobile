/**
 * Guards a `useChat` stream callback (onFinish/onError) against firing after the
 * room it belonged to has already been switched away from.
 *
 * `sendGeneration` is the room generation captured when the stream was started;
 * `currentGeneration` is the live room generation (bumped on every room switch).
 * A late callback from an old room's in-flight HTTP stream is ignored rather than
 * writing `awaitingTurnStart`/messages/poll state for the room now on screen.
 */
export function shouldApplyStreamCallback(
  sendGeneration: number,
  currentGeneration: number,
): boolean {
  return sendGeneration === currentGeneration;
}
