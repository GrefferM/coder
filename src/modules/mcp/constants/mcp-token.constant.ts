/**
 * Head of the key a remote server's token is held under: `mcp-token:<server id>`. Keyed by id, so a rename or move
 * keeps the token.
 */
export const MCP_TOKEN_PREFIX = "mcp-token:";
/** The scheme the token is sent under. */
export const MCP_TOKEN_SCHEME = "Bearer";
/**
 * Head of the key one environment value is held under: `mcp-env:<server id>:<NAME>`. The name is in the project file,
 * the value only here.
 */
export const MCP_ENV_PREFIX = "mcp-env:";
