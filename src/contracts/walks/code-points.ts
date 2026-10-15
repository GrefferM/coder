/** A text's length in code points, as the ceiling counts it: a surrogate pair counts once. */
export function codePoints(text: string): number {
  return [...text].length;
}
