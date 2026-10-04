import { REPEAT_LEAST, REPEAT_MOST } from "../constants";

/** The count typed into «x1», held between one and 999; what is not a number keeps the count it had. */
export function repeatCount(typed: string, was: number): number {
  const count = Number.parseInt(typed.trim(), 10);

  if (Number.isNaN(count)) {
    return was;
  }

  return Math.min(REPEAT_MOST, Math.max(REPEAT_LEAST, count));
}
