import type { Point } from "../../../../../utils/math";

/** A line being drawn: its source sphere and the pointer position. */
export interface DrawnLine {
  agentId: string;
  at: Point;
}

export interface LinkDraftState {
  drawn: DrawnLine | null;
  /** The line let go over nothing, drawn crossed out while it fades. */
  cancelled: DrawnLine | null;
  drawFrom: (agentId: string, at: Point) => void;
  /** Follows the pointer while a line is being drawn; no-op otherwise. */
  followTo: (at: Point) => void;
  /** Let go over nothing — the line is crossed out and fades. */
  cancel: () => void;
  /** Dropped on a sphere that took it; the drawing ends. */
  finish: () => void;
}
