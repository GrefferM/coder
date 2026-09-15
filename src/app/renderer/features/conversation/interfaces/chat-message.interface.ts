import type { ChatCost } from "./chat-cost.interface";
import type { NotStartedReason, TurnCall, ChatStopReason } from "../../../interfaces";
import type { TurnLength } from "./turn-length.interface";
import type { ChatMessageFrom } from "./chat-message-from.type";

/** One turn of a chat. */
export interface ChatMessage {
  id: string;
  /** Whose chat this stands in — one stream holds every agent's, so each says its own. */
  agentId: string;
  from: ChatMessageFrom;
  text: string;
  at: string;
  /** The question this message belongs to, by its own id — the block it is drawn in. */
  questionId: string;
  /**
   * When that question was asked. A conversation is a sequence of questions, so the blocks stand in this
   * order, and two walks running at once never braid.
   */
  askedAt: number;
  /** Set on an agent's own answer and on the copy of it that arrived down a line. */
  cost: ChatCost | null;
  /** The ceiling this turn ran with; the pointer reads the counts against it. */
  answerCeiling: number | null;
  /** The neighbour a line runs to or from. */
  otherAgentId: string | null;
  /** Set only on a line the work did not go down. */
  stopReason: ChatStopReason | null;
  /** Marks an agent's own message as a failure — «упав · 14:26» is read from it. */
  isFailure: boolean;
  /** Set when the turn never began, which is not a fall — there was no attempt to fall. */
  notStarted: NotStartedReason | null;
  /** What would have gone, in characters, on the one turn the ceiling refused. */
  wouldGo: TurnLength | null;
  /** The calls this turn made; they stay in the stream after the card has burned down. */
  calls: TurnCall[];
  /** When this turn began; «КРОК 2 · 19:29» reads its hour from here. */
  began: string | null;
  /** The step this turn was written as; the level of a turn is counted off these and `fedBy`. */
  stepId: string | null;
  /** The walk this turn ran in — turns that broke together share it, and a repeat is a walk of its own. */
  walkId: string | null;
  /** The app's word about this turn; it stands on the rule under the card, and goes to no line or model. */
  note: string | null;
  /** What this turn was asked, so «СПИТАТИ ЩЕ РАЗ» asks it again word for word. */
  asked: string | null;
  /** The steps that fed this turn, so a repeat picks the walk up in its place. */
  fedBy: string[];
}
