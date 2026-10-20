import type { AttachedFile } from "./attached-file.interface";
import type { ChatCost } from "./chat-cost.interface";
import type { NotStartedReason } from "../llm";
import type { TurnCall, ChatStopReason } from "../runs";
import type { CompressionSettings } from "./compression-settings.interface";
import type { TurnLength } from "./turn-length.interface";
import type { ChatMessageFrom } from "./chat-message-from.type";

/** One turn of a chat. */
export interface ChatMessage {
  id: string;
  /** Whose chat this stands in; one stream holds every agent's. */
  agentId: string;
  from: ChatMessageFrom;
  text: string;
  at: string;
  /** The question this message belongs to; the block it is drawn in. */
  questionId: string;
  /** When that question was asked; question blocks stand in this order, so concurrent walks never interleave. */
  askedAt: number;
  /** Set on an agent's own answer and on its copy that arrived down a line. */
  cost: ChatCost | null;
  /** The ceiling this turn ran with; the counts are read against it. */
  answerCeiling: number | null;
  /** The neighbour a line runs to or from. */
  otherAgentId: string | null;
  /** Set only on a line the work did not go down. */
  stopReason: ChatStopReason | null;
  /** Marks an agent's own message as a failure; «упав · 14:26» is read from it. */
  isFailure: boolean;
  /** Set when the turn never began, which is not a fall. */
  notStarted: NotStartedReason | null;
  /** What would have gone, in characters, on the one turn the ceiling refused. */
  wouldGo: TurnLength | null;
  /** How the agent was set to compress when it did before this turn; the stream says it on a rule. */
  compressed: CompressionSettings | null;
  /** Calls this turn made; they stay in the stream after the working card is gone. */
  calls: TurnCall[];
  /** When this turn began; «КРОК 2 · 19:29» reads its hour from here. */
  began: string | null;
  /** The step this turn was written as; a turn's level is counted from these and `fedBy`. */
  stepId: string | null;
  /** The walk this turn ran in; turns that broke together share it, a repeat is its own walk. */
  walkId: string | null;
  /** The app's word about this turn, shown on the rule under the card; goes to no line or model. */
  note: string | null;
  /** What this turn was asked; «СПИТАТИ ЩЕ РАЗ» repeats it verbatim. */
  asked: string | null;
  /** Steps that fed this turn, so a repeat resumes the walk in place. */
  fedBy: string[];
  /** Files and folders attached to a person's question, for the «ПРИКРІПЛЕНО:» row. */
  attached: AttachedFile[];
}
