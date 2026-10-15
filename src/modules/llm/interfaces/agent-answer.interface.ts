import type { TurnCall } from "../../../contracts/runs";

/** One turn's answer; a stop is an answer too, and counts are 0 when the provider gave none. */
export interface AgentAnswer {
  text: string;
  isStopped: boolean;
  isCallsExhausted: boolean;
  /** The answer reached its ceiling, so it is cut mid-word. */
  isCeilingHit: boolean;
  inputTokens: number;
  outputTokens: number;
  calls: TurnCall[];
}
