import { shortLabel } from "./short-label";

/** Two values on one line: the shorter takes only what it needs, and when both are long they halve the room. */
export function sharedLabels(first: string, second: string, room: number): [string, string] {
  if (first.length + second.length <= room) {
    return [first, second];
  }

  const half = Math.floor(room / 2);

  if (first.length <= half) {
    return [first, shortLabel(second, room - first.length)];
  }

  if (second.length <= half) {
    return [shortLabel(first, room - second.length), second];
  }

  return [shortLabel(first, half), shortLabel(second, room - half)];
}
