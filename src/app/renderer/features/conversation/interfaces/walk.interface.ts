import type { ChatMessage } from "./chat-message.interface";
import type { WaitedWork } from "./waited-work.interface";
import type { WalkClosing } from "./walk-closing.interface";
import type { WalkFact } from "./walk-rules.interface";

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
  /** The first turn, held until the question is in the record. */
  heldAsk: WalkFact<"asked"> | null;
  /** The first turn of a question the record refused; «Спитати ще раз» puts it again. */
  unsavedAsk: WalkFact<"asked"> | null;
  /** Turns back but not yet in the record, by card id; their lines go out once written. */
  heldTurns: Record<string, WalkFact<"answered">>;
  /** The end the record refused to stamp; «Спитати ще раз» stamps it again. */
  unclosed: WalkClosing | null;
}
