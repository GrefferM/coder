import type { Point } from "../../../../../utils/math";

/** A line being drawn — the sphere it leaves and where the pointer is. */
export interface DrawnLine {
  agentId: string;
  at: Point;
}

export interface LinkDraftState {
  /** The line being drawn, or `null` when none is. */
  drawn: DrawnLine | null;
  /** The line let go over nothing, while it fades; it is drawn crossed out. */
  cancelled: DrawnLine | null;
  drawFrom: (agentId: string, at: Point) => void;
  /** Follows the pointer while a line is being drawn, and does nothing when none is. */
  followTo: (at: Point) => void;
  /** Let go over nothing — the line is crossed out and fades. */
  cancel: () => void;
  /** Dropped on a sphere that took it — the line is drawn and the drawing is over. */
  finish: () => void;
}
