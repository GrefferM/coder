/**
 * Which found place the stream stands on, by priority:
 *
 * - a moved hand: where it moved to;
 * - a pressed row's promised message;
 * - else the first, the freshest.
 *
 * 0 answers the last two together, and a promise the stream cannot keep.
 */
export function standingIn(found: string[], at: number | null, promised: string | null): number {
  if (at !== null) {
    return at;
  }

  return Math.max(promised === null ? 0 : found.indexOf(promised), 0);
}
