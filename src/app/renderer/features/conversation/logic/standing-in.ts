/**
 * Which of the found places the stream stands on. The order of the three is the whole rule:
 *
 * - the hand moved, and where it moved to is where it stands;
 * - a pressed row promised one message, and that promise outranks the search;
 * - neither: the first of them, which is the freshest, the list being counted backwards.
 *
 * Nought answers the last two together, and answers a promise the stream cannot keep — a run swept since it was
 * read — because a promise nobody can keep is no promise at all.
 */
export function standingIn(found: string[], at: number | null, promised: string | null): number {
  if (at !== null) {
    return at;
  }

  return Math.max(promised === null ? 0 : found.indexOf(promised), 0);
}
