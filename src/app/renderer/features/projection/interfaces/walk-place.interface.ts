import type { WholeStep } from "../../record";

/** Where one turn stands in the flat projection — its column across, and its lane down. */
export interface WalkPlace {
  step: WholeStep;
  /**
   * Which turn of this pass it is, counted from one — and its column across, in that same order: the
   * pass is read left to right, a turn to a column, and the ruler over it says when each one began.
   */
  number: number;
  /** 0 is the top row — the turns no line goes past; 1 and down are the lanes under it. */
  lane: number;
}
