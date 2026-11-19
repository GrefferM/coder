import type { WholeStep } from "../../record";
import type { WalkKnot } from "./walk-knot.interface";

/** Where one turn stands in the flat projection: column across, lane down. */
export interface WalkPlace<TStep extends WalkKnot = WholeStep> {
  step: TStep;
  /** Which turn of the pass it is, from one; also its column, left to right. */
  number: number;
  /** 0 is the top row (turns no line goes past); 1 and down are the lanes under it. */
  lane: number;
}
