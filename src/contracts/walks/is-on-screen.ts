import type { WalkSnapshot } from "./walk-snapshot.interface";

/**
 * Whether the walk, by its row id, belongs to the stream on screen. A walk with no row yet was begun here unless «+
 * НОВИЙ ЧАТ» let it go; the canvas still draws walks not on screen.
 */
export function isOnScreen(walk: WalkSnapshot, runKey: string): boolean {
  const held = walk.walks[runKey] ?? null;
  const row = held?.runId ?? null;

  return row === null ? held?.isPutAway !== true : row === walk.flowRunId;
}
