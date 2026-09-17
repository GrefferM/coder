import type { Point } from "../../../../../../utils/math";

/** One end of a line that names nobody: the id the line carries, and where the canvas put it. */
export interface DeadSphereProps {
  agentId: string;
  at: Point;
}
