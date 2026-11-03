/** No line to start the server, and no address to reach it at. */
export const MCP_SERVER_UNREACHABLE = "MCP_SERVER_UNREACHABLE";

/**
 * A declared environment variable has no value on this machine; the server is not started. The variable's name travels
 * with the refusal.
 */
export const MCP_ENV_VALUE_MISSING = "MCP_ENV_VALUE_MISSING";

/** The server uses a token and this machine holds none. */
export const MCP_TOKEN_MISSING = "MCP_TOKEN_MISSING";

/** A local server's run line, as it stands now, has not been agreed to on this machine; nothing is started. */
export const MCP_CONSENT_MISSING = "MCP_CONSENT_MISSING";
