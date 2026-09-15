/** How this app names itself to a server in the handshake. */
export const MCP_CLIENT_NAME = "coder";
export const MCP_CLIENT_VERSION = "0.1.0";
/**
 * How many of a server's last printed lines are kept. A server that will not start says why on its stderr, and
 * without those words a fallen row is a dead end. Only the tail is of use — the rest is a package manager
 * talking to itself.
 */
export const MCP_STDERR_LINES = 6;
export const MCP_SAID_SEPARATOR = " · ";
export const MCP_SAID_JOIN = " ";
