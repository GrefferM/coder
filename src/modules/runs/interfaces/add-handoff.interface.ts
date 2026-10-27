/** One link a step made: its target, and why it was not taken when it was not. */
export interface AddHandoff {
  toAgentId: string;
  stopReason: string | null;
  /** What the line carried; empty where it was handed nothing. */
  text: string;
}
