import type { ProjectMcpServerDto } from "../../projects";

/** One call of one function: which server holds it, where that server is started, and what it was given. */
export interface McpCall {
  server: ProjectMcpServerDto;
  /** The project's own folder — a server is started where the project stands. */
  directory: string;
  /** The name the server itself gave the function; there is no other handle on it. */
  functionName: string;
  /**
   * The id this call wears everywhere else — in the record, in the stream, on the row. The client keeps no record
   * of its own, but what it counts has to be findable, and «ПОКАЗАТИ ВИКЛИК» is what finds it.
   */
  callId: string;
  arguments: Record<string, unknown>;
}
