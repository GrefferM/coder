import type { WholeStep } from "../../record";

/** Where one turn stands in the flat projection: column across, lane down. */
export interface WalkPlace {
  step: WholeStep;
  /** Which turn of the pass it is, from one; also its column, left to right. */
  number: number;
  /** 0 is the top row (turns no line goes past); 1 and down are the lanes under it. */
  lane: number;
}
