import type { Point } from "../../../utils/math";
import type { WalkPlace } from "./walk-place.interface";

/** One turn of a pass and the spot it stands on, in the projection's own pixels. */
export interface WalkTurn {
  place: WalkPlace;
  at: Point;
}

/** One line of the walk as it is drawn — its run, and the head it carries unless it shares one. */
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

/** A whole pass worked out for drawing — where every turn stands and how every line runs. */
export interface WalkDrawing {
  turns: WalkTurn[];
  lines: WalkDrawnLine[];
  heads: WalkDrawnHead[];
}
