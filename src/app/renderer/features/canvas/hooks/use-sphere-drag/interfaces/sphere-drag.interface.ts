import type { MouseEvent } from "react";
import type { Agent } from "../../../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** The dragged sphere, where it started, and where it is now. */
export interface SphereDragState {
  agentId: string;
  from: Point;
  at: Point;
}

/** The sphere being dragged, and the press that may become a drag. */
export interface SphereDrag {
  drag: SphereDragState | null;
  grabSphere: (event: MouseEvent, agent: Agent) => void;
}
