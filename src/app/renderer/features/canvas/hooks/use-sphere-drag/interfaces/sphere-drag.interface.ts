import type { MouseEvent } from "react";
import type { Agent } from "../../../../../interfaces";
import type { Point } from "../../../../../utils/math";

/** Which sphere is dragged, where it stood, and where it is now. */
export interface SphereDragState {
  agentId: string;
  from: Point;
  at: Point;
}

/** The one sphere being dragged, and the press that may become that drag. */
export interface SphereDrag {
  drag: SphereDragState | null;
  grabSphere: (event: MouseEvent, agent: Agent) => void;
}
