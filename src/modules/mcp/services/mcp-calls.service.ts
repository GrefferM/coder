import { NO_MCP_CALLS } from "../interfaces";
import type { McpCall, McpCallsState, McpResult } from "../interfaces";

/**
 * What the calls to each server have come to since it was connected, by server id. The catalogue only ever asked
 * «what do you hand over», so this is counted where a call actually ends, and the row takes its state from here.
 *
 * Written down nowhere: a server let go and started again is a server given another chance.
 */
export class McpCalls {
  private readonly kept = new Map<string, McpCallsState>();

  /** What the calls to one server have come to; a server nobody has called yet has nothing to say. */
  of(serverId: string): McpCallsState {
    return this.kept.get(serverId) ?? NO_MCP_CALLS;
  }

  /**
   * One call's end. Any call that worked puts the count back to none — the failures before it said something about
   * a page or an argument, and not about the server.
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

  /** A new connection is a new chance: what the calls to the old one came to says nothing about this one. */
  forget(serverId: string): void {
    this.kept.delete(serverId);
  }
}
