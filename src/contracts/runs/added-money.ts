/**
 * Several bills added into one. A bill nobody knows is left out rather than counted as nought, and where not
 * one of them is known the whole is unknown too — «—» on the screen, and never a zero somebody might believe.
 *
 * Both sides add up the same way: the window over the cards of a walk, the record over the steps it read back.
 */
export function addedMoney(sums: (number | null)[]): number | null {
  const known = sums.filter((sum): sum is number => sum !== null);

  return known.length === 0 ? null : known.reduce((whole, sum) => whole + sum, 0);
}
