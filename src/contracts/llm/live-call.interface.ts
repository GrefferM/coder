import type { TurnCall } from "../runs";

/** A call as shown in the running card: out, refused before running, or over. */
export interface LiveCall extends TurnCall {
  state: string;
}
