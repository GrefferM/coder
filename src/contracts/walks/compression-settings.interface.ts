/**
 * How the agent was set to compress its memory when it did, in percent of the model's ceiling: the threshold it started
 * at and the target it was written down to. Read off the record, not off the agent as it is set now.
 */
export interface CompressionSettings {
  at: number;
  to: number;
}
