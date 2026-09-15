import { isOnScreen } from "./is-on-screen";
import type { WalkState } from "../interfaces";

/**
 * Whether the conversation on screen has a walk out. While it has, the hand under the field is «ЗУПИНИТИ» and a
 * second question does not go. Asked by the machine before it takes a question and by the field before it sends.
 */
export function isWalking(walk: WalkState): boolean {
  return Object.values(walk.out).some((turn) => isOnScreen(walk, turn.runKey));
}
