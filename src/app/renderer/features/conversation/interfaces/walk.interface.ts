import type { ChatMessage } from "./chat-message.interface";
import type { WaitedWork } from "./waited-work.interface";

/**
 * One walk of the line as the machine holds it, found by its own id. What belongs to a walk lives inside it:
 * two walks converging on one sphere hold two waits, and one never closes the other's.
 */
export interface Walk {
  /** The question this walk grew from — the block every word of the walk stands in, by its own id. */
  questionId: string;
  /** When that question was asked — the order of blocks, and which of two waits the sphere shows. */
  askedAt: number;
  /**
   * The row this walk writes into, once it is known — one conversation is one row. The walk keeps it after
   * it is over, so the screen can still tell whose words these are.
   */
  runId: string | null;
  /**
   * Every word this walk said, in the order it said them — its own, and nobody else's to erase.
   * A stream emptied takes away only what it showed: the words go with the walk that said them.
   */
  said: ChatMessage[];
  /** The points of this walk holding work while their suppliers have their turns, by the point's agent. */
  waiting: Record<string, WaitedWork>;
  /** The walk broke or was stopped; no turn of it begins after. */
  isStopped: boolean;
  /** Put away with the stream — it writes its record and draws nothing. */
  isPutAway: boolean;
}
