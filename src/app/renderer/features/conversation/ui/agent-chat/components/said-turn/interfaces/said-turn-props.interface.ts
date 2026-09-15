import type { OpenCalls } from "../../../../../hooks";
import type { NamedAgent, WorkingAgent } from "../../../../../../../interfaces";
import type { ChatMessage, ChatStep } from "../../../../../interfaces";

export interface SaidTurnProps {
  message: ChatMessage;
  /** Every agent of the project: one stream holds the turns of all of them. */
  agents: NamedAgent[];
  /** The name and colour to wear where the message names no agent of its own. */
  agentName: string;
  agentColor: string;
  /** Which calls stand open, for both the rows of this turn and the turns still out under it. */
  openCalls: OpenCalls;
  /** The day header, shown once for the first turn of each day. */
  isNewDay: boolean;
  /** The rule «СПИТАЛИ ЗНОВУ» over a question that is not the first of the conversation. */
  isAskedAgain: boolean;
  /** «КРОК 2 · 19:29» — where in the walk this turn stands; `null` where it is no turn of one. */
  step: ChatStep | null;
  /** The repeat under this turn, where one is offered. */
  onAskAgain: (() => void) | null;
  /** The app's own word about this turn, said on the rule under it. */
  words: string | null;
  /** Where the card's own act leads, and whether its words are the ones in the field. */
  act: (() => void) | null;
  isAsked: boolean;
  /** The way into the projection of the pass this question started. */
  onDebug: (() => void) | null;
  /** The turns of this question still out; they stand at the end of its block. */
  live: WorkingAgent[];
  /** This is the message the search drove to; its card wears the edge that says so. */
  isFound: boolean;
  /**
   * The word the stream's search is looking for. It lights inside the person's question and an agent's own
   * answer and nowhere else, because those are the only places the search counts.
   */
  looked: string;
}
