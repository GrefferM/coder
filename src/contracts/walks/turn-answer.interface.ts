import type { ChatCost } from "./chat-cost.interface";
import type { CompressedMemory } from "./compressed-memory.interface";
import type { MemoryFacts } from "../runs";
import type { NotStartedReason, RouteChoice } from "../llm";
import type { TurnCall } from "../runs";
import type { TurnLength } from "./turn-length.interface";

/** One turn back from the machine: what the model said and every word the app has about it. */
export interface TurnAnswer {
  text: string;
  /** The app's own word about this turn, if any; never joins the model's text. */
  note: string | null;
  cost: ChatCost | null;
  /** The ceiling this turn ran with, for reading the counts; null where no model answered. */
  answerCeiling: number | null;
  isFailure: boolean;
  /** The provider's own sentence about a fall, kept for the record; null if the turn did not fall. */
  fell: string | null;
  /** The turn ended without the agent saying its piece, so nothing goes down a line. */
  isCut: boolean;
  /** Set when the turn never began, which is not a fall. */
  notStarted: NotStartedReason | null;
  /** What would have gone, in characters, on the one turn the ceiling refused. */
  wouldGo: TurnLength | null;
  /** How the step ended, for the record; a turn that never began has an end of its own. */
  state: string;
  calls: TurnCall[];
  /** The memory the composer compressed before this turn, whose cost is in `cost`; null where none was. */
  compressed: CompressedMemory | null;
  /**
   * The memories agents called as tools had compressed in this turn, whose cost is in `cost`: the record keeps them under
   * the step that paid for them, and the stream says nothing of them.
   */
  toolMemories: MemoryFacts[];
  /** Where the agent chose to send its answer; null where it chose nothing, and the answer goes down every line. */
  route: RouteChoice | null;
}
