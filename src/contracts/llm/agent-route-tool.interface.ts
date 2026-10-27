import type { RouteOption } from "./route-option.interface";

/**
 * A function the app itself offers an agent that chooses its route, which is no grant: `passTo` names the agents the
 * answer goes to, `finishHere` ends the branch. Both carry the options so the call is checked against them.
 */
export interface AgentRouteTool {
  source: "route";
  name: string;
  description: string;
  action: "passTo" | "finishHere";
  /** Whom the answer may go to; the same list on both. */
  options: RouteOption[];
}
