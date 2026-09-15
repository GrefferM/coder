import type { TurnCall } from "../runs";

/** A call as it stands in the running card — out, refused before it ran, or over. */
export interface LiveCall extends TurnCall {
  state: string;
}
