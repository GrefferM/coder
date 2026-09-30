import type { McpCallsState } from "./mcp-calls-state.interface";

/** A server not yet called; distinct from one whose every call failed. */
export const NO_MCP_CALLS: McpCallsState = {
  failedInARow: 0,
  hasWorked: false,
  lastFailure: null,
};
