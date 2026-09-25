import type { ProjectMcpServer } from "../../../contracts/project";

/**
 * What this module needs of whoever reaches MCP servers. No line and no exit code: a server was asked, not a
 * program run, and a call that could not happen comes back named rather than thrown.
 */
export interface ServerRunner {
  call(payload: {
    server: ProjectMcpServer;
    directory: string;
    functionName: string;
    arguments: Record<string, unknown>;
    /** The id this call wears everywhere else, so what a server's calls come to can lead back to it. */
    callId: string;
    /** Aborts the request the moment the turn is stopped. */
    signal?: AbortSignal;
  }): Promise<{ output: string; isFailed: boolean }>;
}
