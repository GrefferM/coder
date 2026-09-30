import type { ToolGrant } from "../../../interfaces";

/**
 * One mark of the arc before it is drawn or folded: a single declared command, or a whole server with all it is
 * granted. A kind's «+» holds a list of these.
 */
export interface ArmedFold {
  group: string;
  granted: ToolGrant[];
}
