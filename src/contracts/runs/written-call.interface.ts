import type { TurnCall } from "./turn-call.interface";

/** One call as the record takes it, and which of the ends it came to. */
export interface WrittenCall extends TurnCall {
  end: string;
}
