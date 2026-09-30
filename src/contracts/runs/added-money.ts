/**
 * Several bills added into one. An unknown bill is left out, not counted as nought; if none is known the sum is `null`.
 */
export function addedMoney(sums: (number | null)[]): number | null {
  const known = sums.filter((sum): sum is number => sum !== null);

  return known.length === 0 ? null : known.reduce((whole, sum) => whole + sum, 0);
}
