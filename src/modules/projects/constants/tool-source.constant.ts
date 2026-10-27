import type { ToolSource } from "../interfaces";

/** A function the user declared themselves. */
export const COMMAND_TOOL_SOURCE = "command" satisfies ToolSource;
/** A function an MCP server hands over. */
export const MCP_TOOL_SOURCE = "mcp" satisfies ToolSource;
/** One of the app's own commands, the same in every project. */
export const SYSTEM_TOOL_SOURCE = "system" satisfies ToolSource;
/** Another agent, granted to be called as a tool. */
export const AGENT_TOOL_SOURCE = "agent" satisfies ToolSource;
