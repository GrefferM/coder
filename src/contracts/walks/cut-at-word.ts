import { codePoints } from "./code-points";

/** Which end of a text is kept when it runs over: the start (the end is cut off) or the end (the start is dropped). */
export type CutSide = "start" | "end";

/**
 * A text held to `room` characters, bar the spaces around it. A text that fits is returned whole. What runs over is cut
 * off the end, or dropped from the start, so that the side kept is the one that matters; the cut falls between words
 * where it can, and a word it would leave half of goes with it. Where the text is one word long, what a cut word has stays.
 */
export function cutAtWord(text: string, room: number, keeps: CutSide): string {
  if (codePoints(text) <= room) {
    return text.trim();
  }

  const letters = [...text];
  const size = Math.max(room, 0);

  return (keeps === "start" ? keptStart(letters, size) : keptEnd(letters, size)).join("").trim();
}

/** The first `size` letters, back to the last whole word where the next letter would have been mid-word. */
function keptStart(letters: string[], size: number): string[] {
  const kept = letters.slice(0, size);
  const isMidWord = letters[kept.length] !== undefined && !/\s/u.test(letters[kept.length]);
  const lastSpace = kept.map((letter) => /\s/u.test(letter)).lastIndexOf(true);

  return isMidWord && lastSpace > 0 ? kept.slice(0, lastSpace) : kept;
}

/** The last `size` letters, forward to the first whole word where the letter before them was mid-word. */
function keptEnd(letters: string[], size: number): string[] {
  const from = letters.length - size;
  const kept = letters.slice(from);
  const isMidWord = from > 0 && kept.length > 0 && !/\s/u.test(letters[from - 1]) && !/\s/u.test(kept[0]);
  const firstSpace = kept.findIndex((letter) => /\s/u.test(letter));

  return isMidWord && firstSpace >= 0 ? kept.slice(firstSpace + 1) : kept;
}
