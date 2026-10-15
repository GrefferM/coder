import type { TurnCall } from "../runs";

/** A call as shown in the running card. */
export interface LiveCall extends TurnCall {
  /** One of the `RUN_CALL_*` states. */
  state: string;
}
