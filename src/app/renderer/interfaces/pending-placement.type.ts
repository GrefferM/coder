import type { Point } from "../utils/math";

/** Where a new agent will stand: the right-clicked point, or the canvas middle, resolved at save. */
export type PendingPlacement = { kind: "point"; at: Point } | { kind: "centre" };
