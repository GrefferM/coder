/** A call that did not work, in the server's own words. */
export interface McpCallFailure {
  /** The same id the record keeps and the stream draws for this call. */
  callId: string;
  functionName: string;
  said: string;
  at: number;
}

/**
 * What the calls to one server have come to since it was connected: a server can stand green and answer no call
 * at all. Counted from the connection, so a restart is another chance, and written down nowhere.
 */
export interface McpCallsState {
  /** Failures one after another; any call that works puts it back to none. */
  failedInARow: number;
  hasWorked: boolean;
  lastFailure: McpCallFailure | null;
}
