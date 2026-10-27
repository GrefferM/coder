import type { AgentSystemTool } from "./agent-system-tool.interface";
import type { AgentTool } from "./agent-tool.type";

/** Whether the tool is a system command of the app, which runs nothing of its own. */
export function isSystemTool(tool: AgentTool): tool is AgentSystemTool {
  return tool.source === "system";
}
