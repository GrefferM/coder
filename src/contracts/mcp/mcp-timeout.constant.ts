/**
 * How long a server has to answer the handshake before it counts as fallen; generous because `npx some-server@latest`
 * downloads the package first. Shared because the screen states the number («СПИНИМО ЧЕРЕЗ 2 ХВ»).
 */
export const MCP_CONNECT_TIMEOUT_MS = 120_000;
