import type { AgentCommandTool } from "./agent-command-tool.interface";
import type { AgentTool } from "./agent-tool.type";

/** Whether this is a declared command — the one kind with a line to run and arguments this app can check. */
export function isCommandTool(tool: AgentTool): tool is AgentCommandTool {
  return tool.source === "command";
}
