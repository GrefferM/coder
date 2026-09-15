/** One row per server this machine has looked at — what it handed over, and when that last changed. */
export const MCP_SERVER_LOOK_TABLE_NAME = "mcp_server_looks";
/** One row per server deleted here, until its keys have left the machine or the undo brought it back. */
export const MCP_DROPPED_SERVER_TABLE_NAME = "mcp_dropped_servers";
