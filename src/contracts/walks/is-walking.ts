import { isOnScreen } from "./is-on-screen";
import type { WalkSnapshot } from "./walk-snapshot.interface";

/**
 * The walks of the conversation on screen that are out, by their keys: one with a turn out, or with a question or an
 * answer waiting on the record.
 */
export function walkingKeys(walk: WalkSnapshot): string[] {
  const out = Object.values(walk.out).map((turn) => turn.runKey);
  const held = Object.entries(walk.walks)
    .filter(([, one]) => one.heldAsk !== null || Object.keys(one.heldTurns).length > 0)
    .map(([runKey]) => runKey);
  const keys = new Set([...out, ...held]);

  return [...keys].filter((runKey) => isOnScreen(walk, runKey));
}

/**
 * Whether the conversation on screen has a walk out; while it does, the button is «ЗУПИНИТИ» and a second question does
 * not go.
 */
export function isWalking(walk: WalkSnapshot): boolean {
  return walkingKeys(walk).length > 0;
}
