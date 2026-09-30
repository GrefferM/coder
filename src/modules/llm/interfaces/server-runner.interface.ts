import type { ProjectMcpServer } from "../../../contracts/project";

/**
 * What this module needs of whoever reaches MCP servers. No line or exit code; a call that could not happen comes back
 * named, not thrown.
 */
export interface ServerRunner {
  call(payload: {
    server: ProjectMcpServer;
    directory: string;
    functionName: string;
    arguments: Record<string, unknown>;
    /** The call's id everywhere else, so a server's calls can be traced back. */
    callId: string;
    /** Aborts the request the moment the turn is stopped. */
    signal?: AbortSignal;
  }): Promise<{ output: string; isFailed: boolean }>;
}
