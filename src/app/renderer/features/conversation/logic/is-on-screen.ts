import type { WalkState } from "../interfaces";

/**
 * Whether this walk belongs to the stream on screen, asked by the row's own id. A walk with no row yet was begun
 * here, unless «+ НОВИЙ ЧАТ» let it go. What is not of this screen is still drawn on the canvas.
 */
export function isOnScreen(walk: WalkState, runKey: string): boolean {
  const held = walk.walks[runKey] ?? null;
  const row = held?.runId ?? null;

  return row === null ? held?.isPutAway !== true : row === walk.flowRunId;
}
