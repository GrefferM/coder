import type { Point } from "../../../utils/math";
import type { WalkPlace } from "./walk-place.interface";

/** One turn of a pass and its spot, in projection pixels. */
export interface WalkTurn {
  place: WalkPlace;
  at: Point;
}

/** One drawn line: its run, and its head unless a shared one is drawn by the receiver. */
export interface WalkDrawnLine {
  id: string;
  path: string;
  arrow: string;
}

/** The one head a turn draws for every line that arrives at it. */
export interface WalkDrawnHead {
  id: string;
  arrow: string;
}

/** A pass laid out for drawing: every turn's spot and every line's run. */
export interface WalkDrawing {
  turns: WalkTurn[];
  lines: WalkDrawnLine[];
  heads: WalkDrawnHead[];
}
