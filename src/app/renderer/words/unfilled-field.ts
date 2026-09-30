import type { WrittenNumber } from "../interfaces";

/** The first unwritten field, named as its form names it, or `null`; the order is the form's. */
export function unfilledField(numbers: WrittenNumber[]): string | null {
  return numbers.find(([value]) => value === null)?.[1] ?? null;
}
