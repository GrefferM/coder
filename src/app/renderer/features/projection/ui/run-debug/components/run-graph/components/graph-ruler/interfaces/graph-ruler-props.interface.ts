import type { Point } from "../../../../../../../../../utils/math";
import type { WalkTurn } from "../../../../../../../interfaces";

export interface GraphRulerProps {
  turns: WalkTurn[];
  /** When the question was asked; marks count from it. */
  askedAt: Date;
  /** The field's position; the ruler follows it horizontally only. */
  pan: Point;
  scale: number;
}
