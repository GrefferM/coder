import type { ChatTurn } from "../../../interfaces";

/** What goes to the model ahead of the turn's own words; an agent's memory fills one of the two, or neither. */
export interface TurnMemory {
  /** The agent's own pairs in this conversation. */
  thread: ChatTurn[];
  /** What has happened to the question so far, as the record tells it; it opens the turn's own words. */
  shared: string;
}
