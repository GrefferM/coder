import type { ToolSource } from "../interfaces";

/** A function the user declared themselves. */
export const COMMAND_TOOL_SOURCE = "command" satisfies ToolSource;
/** A function an MCP server hands over. */
export const MCP_TOOL_SOURCE = "mcp" satisfies ToolSource;
