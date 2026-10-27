import type { SystemCommandId } from "../project/system-command.constant";
import type { RouteOption } from "./route-option.interface";

/**
 * A system command the app itself gives an agent it was granted to: `pass_to` hands the agents it names a text the agent
 * writes for them, `finish_here` ends the branch and the agent's turn.
 */
export interface AgentSystemTool {
  source: "system";
  name: string;
  description: string;
  command: SystemCommandId;
  /** Whom `pass_to` may name; none for `finish_here`, which names nobody. */
  options: RouteOption[];
}
