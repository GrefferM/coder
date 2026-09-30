import { isOnScreen } from "./is-on-screen";
import type { WalkState } from "../interfaces";

/**
 * Whether the conversation on screen has a walk out; while it does, the button is «ЗУПИНИТИ» and a second question does
 * not go.
 */
export function isWalking(walk: WalkState): boolean {
  return Object.values(walk.out).some((turn) => isOnScreen(walk, turn.runKey));
}
