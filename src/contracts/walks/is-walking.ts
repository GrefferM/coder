import { isOnScreen } from "./is-on-screen";
import type { WalkSnapshot } from "./walk-snapshot.interface";

/**
 * Whether the conversation on screen has a walk out, a turn out or one waiting on the record; while it does, the button
 * is «ЗУПИНИТИ» and a second question does not go.
 */
export function isWalking(walk: WalkSnapshot): boolean {
  return (
    Object.values(walk.out).some((turn) => isOnScreen(walk, turn.runKey)) ||
    Object.entries(walk.walks).some(
      ([runKey, held]) => isOnScreen(walk, runKey) && (held.heldAsk !== null || Object.keys(held.heldTurns).length > 0),
    )
  );
}
