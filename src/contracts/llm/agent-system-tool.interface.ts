import type { SystemCommandId } from "../project/system-command.constant";
import type { RouteOption } from "./route-option.interface";

/**
 * A system command the app itself gives an agent it was granted to: `pass_to` names the agents the agent's input or answer
 * goes to, `finish_here` ends the branch. Both end the agent's turn once called, and neither asks it to write anything.
 */
export interface AgentSystemTool {
  source: "system";
  name: string;
  description: string;
  command: SystemCommandId;
  /** Whom `pass_to` may name; none for `finish_here`, which names nobody. */
  options: RouteOption[];
}
