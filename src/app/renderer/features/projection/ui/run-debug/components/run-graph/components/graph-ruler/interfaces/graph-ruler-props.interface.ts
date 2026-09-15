import type { Point } from "../../../../../../../../../utils/math";
import type { WalkTurn } from "../../../../../../../interfaces";

export interface GraphRulerProps {
  turns: WalkTurn[];
  /** The moment the question was asked: every mark is counted from it. */
  askedAt: Date;
  /** Where the field stands, so the ruler can follow it across without going with it down. */
  pan: Point;
  scale: number;
}
