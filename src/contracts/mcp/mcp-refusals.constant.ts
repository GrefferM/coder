/** No line to start the server, and no address to reach it at. */
export const MCP_SERVER_UNREACHABLE = "MCP_SERVER_UNREACHABLE";

/**
 * The project declares an environment variable this machine holds no value for. The server is not started at
 * all: begun without it, the process fails later and further away. The variable's name travels with the refusal.
 */
export const MCP_ENV_VALUE_MISSING = "MCP_ENV_VALUE_MISSING";

/** The server is signed in to by a token and this machine holds none — neither a fall nor a wrong address. */
export const MCP_TOKEN_MISSING = "MCP_TOKEN_MISSING";
