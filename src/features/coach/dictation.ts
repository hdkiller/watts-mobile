/** Append a server transcript into the coach composer (web ChatInput parity). */
export function appendTranscript(current: string, transcript: string): string {
  const next = transcript.trim();
  if (!next) return current;
  if (!current.trim()) return next;
  const needsSpace = !/\s$/.test(current);
  return `${current}${needsSpace ? ' ' : ''}${next}`;
}
