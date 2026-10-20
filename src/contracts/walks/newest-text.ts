import { codePoints } from "./code-points";

/**
 * As much of a text as fits in `room` characters, its end kept and its start dropped. A text that fits is returned as it
 * is. This is how the composer reads a memory too long to be read whole, which only a very long answer or a jump of
 * the shared memory brings about; what it leaves out is the oldest of it. The cut falls between words where it can.
 */
export function newestText(text: string, room: number): string {
  if (codePoints(text) <= room) {
    return text;
  }

  const letters = [...text];
  const from = letters.length - Math.max(room, 0);
  const kept = letters.slice(from);
  const isMidWord = from > 0 && kept.length > 0 && !/\s/u.test(letters[from - 1]) && !/\s/u.test(kept[0]);
  const firstSpace = kept.findIndex((letter) => /\s/u.test(letter));
  const whole = isMidWord && firstSpace >= 0 ? kept.slice(firstSpace + 1) : kept;

  return whole.join("").trim();
}
