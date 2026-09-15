import type { UnfinishedArrival } from "./unfinished-arrival.interface";
import type { UnfinishedTurn } from "./unfinished-turn.interface";

/** Where one question's walk stopped: what has to run again, and what has arrived and is waiting to be taken. */
export interface RunUnfinished {
  again: UnfinishedTurn[];
  arrivals: UnfinishedArrival[];
}
