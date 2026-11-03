/** One row per server this machine has looked at: what it handed over, and when that last changed. */
export const MCP_SERVER_LOOK_TABLE_NAME = "mcp_server_looks";
/** One row per server deleted here, until its keys are swept or the undo restores it. */
export const MCP_DROPPED_SERVER_TABLE_NAME = "mcp_dropped_servers";
/** One row per local server this machine agreed to start: the line it agreed to, word for word. */
export const MCP_SERVER_CONSENT_TABLE_NAME = "mcp_server_consents";
