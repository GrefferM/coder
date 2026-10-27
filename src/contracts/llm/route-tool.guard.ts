import type { AgentRouteTool } from "./agent-route-tool.interface";
import type { AgentTool } from "./agent-tool.type";

/** Whether the tool is the app's own choice of route, which runs nothing of its own. */
export function isRouteTool(tool: AgentTool): tool is AgentRouteTool {
  return tool.source === "route";
}
