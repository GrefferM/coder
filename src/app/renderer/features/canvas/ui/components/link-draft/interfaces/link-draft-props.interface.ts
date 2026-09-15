import type { Agent } from "../../../../../../interfaces";
import type { Point } from "../../../../../../utils/math";

export interface LinkDraftProps {
  from: Agent;
  at: Point;
  target?: Agent;
  isCancelled?: boolean;
}
