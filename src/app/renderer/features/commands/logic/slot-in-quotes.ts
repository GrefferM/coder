import { SLOT_QUOTE_MARKS } from "../constants";

/**
 * Whether the slot stands in quotes of its own in the run line, `'{mask}'` and nothing else inside. Only there does an
 * empty optional slot leave `''` behind.
 */
export function slotInQuotes(run: string, name: string): boolean {
  const wanted = name.trim();

  if (wanted === "") {
    return false;
  }

  const slot = `{${wanted}}`;

  for (let at = run.indexOf(slot); at >= 0; at = run.indexOf(slot, at + 1)) {
    const before = run[at - 1];
    const after = run[at + slot.length];

    if (before !== undefined && before === after && SLOT_QUOTE_MARKS.includes(before)) {
      return true;
    }
  }

  return false;
}
