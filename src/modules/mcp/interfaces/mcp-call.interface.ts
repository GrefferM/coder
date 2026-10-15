import type { ProjectMcpServerDto } from "../../projects";

export interface McpCall {
  server: ProjectMcpServerDto;
  /** The project's own folder, where a server is started. */
  directory: string;
  /** The name the server gave the function. */
  functionName: string;
  /** The id this call wears in the record, the stream and the row; «ПОКАЗАТИ ВИКЛИК» finds it by this. */
  callId: string;
  arguments: Record<string, unknown>;
  /** Aborts the request the moment the turn is stopped. */
  signal?: AbortSignal;
}
