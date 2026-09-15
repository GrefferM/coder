import { RUN_CALL_RAN, RUN_CALL_REFUSED, RUN_CALL_SAID_NO } from "../../record";
import type { TurnCall } from "../../../interfaces";

/**
 * Which end a finished call came to — a call that ran has an exit code, a refused one has words
 * instead of it, and a server's «ні» has neither: the function is there and the answer is a refusal of its own.
 */
export function callEnd(call: TurnCall): string {
  if (call.refusal !== "") {
    return RUN_CALL_REFUSED;
  }

  return call.isFailed ? RUN_CALL_SAID_NO : RUN_CALL_RAN;
}
