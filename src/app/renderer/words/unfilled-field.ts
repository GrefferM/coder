import type { WrittenNumber } from "../interfaces";

/**
 * The first of them nobody has written, named as its own form names it, or `null` where every one
 * is. The order is the form's, so the word points at the first row the person will meet.
 */
export function unfilledField(numbers: WrittenNumber[]): string | null {
  return numbers.find(([value]) => value === null)?.[1] ?? null;
}
