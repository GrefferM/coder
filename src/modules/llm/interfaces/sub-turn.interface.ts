import type { ReachableAgent } from "../../../contracts/llm";
import type { RunningTurn } from "./running-turn.interface";

/** One agent asked as a tool from inside a running turn. */
export interface SubTurn {
  /** The turn whose call this is. */
  turn: RunningTurn;
  agent: ReachableAgent;
  request: string;
  signal: AbortSignal;
}
