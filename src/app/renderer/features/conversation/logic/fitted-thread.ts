import { codePoints } from "./code-points";
import type { ChatTurn } from "../../../interfaces";

/** The newest whole pairs of the thread that fit in `room` characters; the oldest go first, never half a pair. */
export function fittedThread(thread: ChatTurn[], room: number): ChatTurn[] {
  let left = room;
  let kept = thread.length;

  while (kept > 1) {
    const [input, answer] = thread.slice(kept - 2, kept);
    const size = codePoints(input.text) + codePoints(answer.text);

    if (size > left) {
      break;
    }

    left -= size;
    kept -= 2;
  }

  return thread.slice(kept);
}
