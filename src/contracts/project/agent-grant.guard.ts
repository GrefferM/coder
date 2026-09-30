import type { AgentToolGrant } from "./agent-tool-grant.interface";
import type { ToolGrant } from "./tool-grant.type";

/** A grant of another agent as a tool, told apart by `source`. */
export function isAgentGrant(grant: ToolGrant): grant is AgentToolGrant {
  return grant.source === "agent";
}
