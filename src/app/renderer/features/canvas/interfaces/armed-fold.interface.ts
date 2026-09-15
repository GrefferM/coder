import type { ToolGrant } from "../../../interfaces";

/**
 * One mark of the arc as the logic holds it, before it is drawn or folded: a single declared command, or a whole
 * server with everything granted of it. What ends up under a порода's «+» is a list of these.
 */
export interface ArmedFold {
  group: string;
  granted: ToolGrant[];
}
