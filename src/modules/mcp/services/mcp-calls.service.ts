import { NO_MCP_CALLS } from "../interfaces";
import type { McpCall, McpCallsState, McpResult } from "../interfaces";

/**
 * What the calls to each server have come to since it was connected, by server id; the row takes its state from here.
 * Not persisted: a restarted server gets another chance.
 */
export class McpCalls {
  private readonly kept = new Map<string, McpCallsState>();

  /** What the calls to one server have come to; nothing for a server not yet called. */
  of(serverId: string): McpCallsState {
    return this.kept.get(serverId) ?? NO_MCP_CALLS;
  }

  /**
   * One call's end. Any call that worked resets the failure count, since earlier failures concerned a page or an
   * argument, not the server.
   */
  noted(serverId: string, call: Pick<McpCall, "callId" | "functionName">, result: McpResult): void {
    const standing = this.of(serverId);

    this.kept.set(
      serverId,
      result.isFailed
        ? {
            failedInARow: standing.failedInARow + 1,
            hasWorked: standing.hasWorked,
            lastFailure: {
              callId: call.callId,
              functionName: call.functionName,
              said: result.output,
              at: Date.now(),
            },
          }
        : {
            failedInARow: 0,
            hasWorked: true,
            lastFailure: null,
          },
    );
  }

  /** A new connection is a new chance; the old one's calls say nothing about it. */
  forget(serverId: string): void {
    this.kept.delete(serverId);
  }
}
