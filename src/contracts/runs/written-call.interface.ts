import type { TurnCall } from "./turn-call.interface";

/** One call as the record takes it, with the end it came to. */
export interface WrittenCall extends TurnCall {
  end: string;
}
