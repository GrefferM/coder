import type { OpenCalls } from "../../../../../hooks";
import type { NamedAgent, WorkingAgent } from "../../../../../../../interfaces";
import type { ChatMessage, ChatStep } from "../../../../../interfaces";
import type { CardAloud } from "../../answer-card";

export interface SaidTurnProps {
  message: ChatMessage;
  /** Every agent of the project; one stream holds all their turns. */
  agents: NamedAgent[];
  /** The name and colour used where the message names no agent. */
  agentName: string;
  agentColor: string;
  /** Which calls are open, for this turn's rows and the turns still out under it. */
  openCalls: OpenCalls;
  /** The day header, shown once for the first turn of each day. */
  isNewDay: boolean;
  /** The rule «НОВИЙ ЗАПИТ» over a question that is not the conversation's first. */
  isAskedAgain: boolean;
  /** «КРОК 2 · 19:29»: the turn's place in the walk; `null` when it is not part of one. */
  step: ChatStep | null;
  /** The repeat under this turn, where one is offered. */
  onAskAgain: (() => void) | null;
  /** The app's own word about this turn, on the rule under it. */
  words: string | null;
  /** Where the card's act leads, and whether its words are the ones in the field. */
  act: (() => void) | null;
  isAsked: boolean;
  /** The way into the projection of the pass this question started. */
  onDebug: (() => void) | null;
  /** The turns of this question still out, at the end of its block. */
  live: WorkingAgent[];
  /** The message the search drove to; its card wears the edge. */
  isFound: boolean;
  /** The searched word, lit only in the person's question and an agent's answer: the only places the search counts. */
  looked: string;
  /** The speaker over an agent's answer; `null` where the turn has no words to read (4k). */
  aloud: CardAloud | null;
}
