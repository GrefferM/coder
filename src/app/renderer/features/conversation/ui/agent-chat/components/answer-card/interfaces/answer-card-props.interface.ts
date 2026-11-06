import type { ChatCost, ChatStep } from "../../../../../interfaces";
import type { CardAloud } from "./card-aloud.interface";

/** `cost` is `null` both while streaming and when the provider reported nothing; `isCounting` tells them apart. */
export interface AnswerCardProps {
  agentName: string;
  agentColor: string;
  text: string;
  cost: ChatCost | null;
  /** The ceiling the turn ran with, named on the pointer beside the counts; `null` where none. */
  answerCeiling?: number | null;
  isCounting: boolean;
  /** The turn's place in the walk, «КРОК 2 · 19:29», named at the head's far end after the cost. */
  step?: ChatStep | null;
  /** This card is where the search stopped and wears the edge that says so. */
  isFound?: boolean;
  /** The word the stream's search is looking for, lit inside the words; empty where none. */
  looked?: string;
  /** The speaker at the head's far end; `null` where the card is not read aloud (4k). */
  aloud?: CardAloud | null;
}
