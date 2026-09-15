import type { McpCallsState } from "./mcp-calls-state.interface";

/** A server nobody has called yet — not the same as one whose every call failed. */
export const NO_MCP_CALLS: McpCallsState = {
  failedInARow: 0,
  hasWorked: false,
  lastFailure: null,
};
