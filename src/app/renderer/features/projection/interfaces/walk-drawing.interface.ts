import type { Point } from "../../../utils/math";
import type { WholeStep } from "../../record";
import type { WalkKnot } from "./walk-knot.interface";
import type { WalkPlace } from "./walk-place.interface";

/** One turn of a pass and its spot, in projection pixels. */
export interface WalkTurn<TStep extends WalkKnot = WholeStep> {
  place: WalkPlace<TStep>;
  at: Point;
}

/** One drawn line: its run, and its head unless a shared one is drawn by the receiver. */
export interface WalkDrawnLine {
  id: string;
  /** The turn the line leaves and the one it reaches, by their ids. */
  fromId: string;
  toId: string;
  path: string;
  arrow: string;
}

/** The one head a turn draws for every line that arrives at it. */
export interface WalkDrawnHead {
  id: string;
  arrow: string;
}

/** A pass laid out for drawing: every turn's spot and every line's run. */
export interface WalkDrawing<TStep extends WalkKnot = WholeStep> {
  turns: WalkTurn<TStep>[];
  lines: WalkDrawnLine[];
  heads: WalkDrawnHead[];
}
