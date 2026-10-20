import { codePoints } from "./code-points";

/**
 * The composer's message held to its budget in characters: what runs over is cut off the end, which is where the oldest
 * of it stands. The cut falls between words where it can, and what is left has no space at its end.
 */
export function cutComposed(text: string, budget: number): string {
  if (codePoints(text) <= budget) {
    return text.trim();
  }

  const letters = [...text];
  const kept = letters.slice(0, Math.max(budget, 0));
  const isMidWord = letters[kept.length] !== undefined && !/\s/u.test(letters[kept.length]);
  const lastSpace = kept.map((letter) => /\s/u.test(letter)).lastIndexOf(true);
  const whole = isMidWord && lastSpace > 0 ? kept.slice(0, lastSpace) : kept;

  return whole.join("").trim();
}
