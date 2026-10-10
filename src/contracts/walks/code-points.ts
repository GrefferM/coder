/** A text's length in code points: a character the person sees counts once. */
export function codePoints(text: string): number {
  return [...text].length;
}
