import type { AgentAgentTool } from "./agent-agent-tool.interface";
import type { AgentTool } from "./agent-tool.type";

/** Whether this tool is another agent, the one kind that runs a turn of its own. */
export function isAgentTool(tool: AgentTool): tool is AgentAgentTool {
  return tool.source === "agent";
}
