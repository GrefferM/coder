import type { WalkLineSizes } from "./walk-line.interface";

/** Where a pass is drawn, in pixels: a column per turn, a top row, a lane under it for each branch gone round. */
export interface WalkGrid {
  firstColumnX: number;
  columnWidth: number;
  topRowY: number;
  laneHeight: number;
  line: WalkLineSizes;
}
