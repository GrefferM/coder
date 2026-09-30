import type { ChatMessage } from "./chat-message.interface";
import type { WaitedWork } from "./waited-work.interface";

/**
 * One walk of the line as the machine holds it, found by its own id; two walks converging on one sphere hold two
 * separate waits.
 */
export interface Walk {
  /** The question this walk grew from, by its block id. */
  questionId: string;
  /** When the question was asked: orders the blocks and picks which of two waits the sphere shows. */
  askedAt: number;
  /** The row this walk writes into, once known; kept after the walk is over. */
  runId: string | null;
  /** Every word this walk said, in order; emptying a stream removes only these. */
  said: ChatMessage[];
  /** Points of this walk holding work while their suppliers take their turns, by the point's agent. */
  waiting: Record<string, WaitedWork>;
  /** The walk broke or was stopped; no turn of it begins after. */
  isStopped: boolean;
  /** Put away with the stream: still writes its record, draws nothing. */
  isPutAway: boolean;
}
