import type { ChatCost } from "./chat-cost.interface";
import type { NotStartedReason, TurnCall } from "../../../interfaces";
import type { TurnLength } from "./turn-length.interface";

/** One turn come back from the machine — what the model said, and every word the app has about it. */
export interface TurnAnswer {
  text: string;
  /** The app's own word about this turn, if it has one; it never joins the model's text. */
  note: string | null;
  cost: ChatCost | null;
  /** The ceiling this turn ran with, so the counts can be read against it; unknown where no model answered. */
  answerCeiling: number | null;
  isFailure: boolean;
  /** The turn ended without the agent saying its piece, so nothing goes down a line. */
  isCut: boolean;
  /** Set when the turn never began, which is not a fall — there was no attempt to fall. */
  notStarted: NotStartedReason | null;
  /** What would have gone, in characters, on the one turn the ceiling refused. */
  wouldGo: TurnLength | null;
  /** How the step ended, for the record; a turn that never began has an end of its own. */
  state: string;
  calls: TurnCall[];
}
