import type { AgentAgentTool } from "./agent-agent-tool.interface";
import type { AgentTool } from "./agent-tool.type";

/** Whether the tool is another agent, the only kind that runs a turn of its own. */
export function isAgentTool(tool: AgentTool): tool is AgentAgentTool {
  return tool.source === "agent";
}
