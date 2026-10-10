import type { UnfinishedArrival } from "./unfinished-arrival.interface";
import type { UnfinishedTurn } from "./unfinished-turn.interface";

/** Where one question's walk stopped: what must run again, and what arrived and awaits pickup. */
export interface RunUnfinished {
  again: UnfinishedTurn[];
  arrivals: UnfinishedArrival[];
}
