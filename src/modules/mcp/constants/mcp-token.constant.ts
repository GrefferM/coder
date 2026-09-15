/**
 * The head of the key a remote server's token is held under — `mcp-token:<server id>`. By the id and
 * never by the name or the address: a server renamed, or moved, is the same server and keeps its token.
 */
export const MCP_TOKEN_PREFIX = "mcp-token:";
/** What the token is sent as. The servers that take one take it this way, and the word is theirs, not ours. */
export const MCP_TOKEN_SCHEME = "Bearer";
/**
 * The head of the key one environment value is held under — `mcp-env:<server id>:<NAME>`. The name rides in the
 * project file, the value stays here: a key in a file that goes into a repository is a key in a pull request.
 */
export const MCP_ENV_PREFIX = "mcp-env:";
