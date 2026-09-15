import type { ChatCost, ChatStep } from "../../../../../interfaces";

/** `cost` is `null` both while streaming and when the provider reported nothing; `isCounting` tells those apart. */
export interface AnswerCardProps {
  agentName: string;
  agentColor: string;
  text: string;
  cost: ChatCost | null;
  /** The ceiling the turn ran with, named on the pointer beside the counts; `null` where none stood. */
  answerCeiling?: number | null;
  isCounting: boolean;
  /** Set on a turn read back out of a run; the head then names the step, «КРОК 2 · 19:29», not the cost. */
  step?: ChatStep | null;
  /** This card is where the search stopped — it wears the edge that says so. */
  isFound?: boolean;
  /** The word the stream's own search is looking for, lit inside these words; empty where none is. */
  looked?: string;
}
