/** A call that did not work, in the server's own words. */
export interface McpCallFailure {
  /** The id the record keeps and the stream draws for this call. */
  callId: string;
  functionName: string;
  said: string;
  at: number;
}

/**
 * What calls to one server have come to since it connected (a green server may answer no call). Counted per connection,
 * so a restart resets it; not persisted.
 */
export interface McpCallsState {
  /** Consecutive failures; a successful call resets it to zero. */
  failedInARow: number;
  hasWorked: boolean;
  lastFailure: McpCallFailure | null;
}
