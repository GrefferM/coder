import { RUN_CALL_RAN, RUN_CALL_REFUSED, RUN_CALL_SAID_NO } from "../runs/run-call-end.constant";
import type { TurnCall } from "../runs/turn-call.interface";

/** Which end a finished call came to: a run has an exit code, a refusal has words, and a server's «ні» has neither. */
export function callEnd(call: TurnCall): string {
  if (call.refusal !== "") {
    return RUN_CALL_REFUSED;
  }

  return call.isFailed ? RUN_CALL_SAID_NO : RUN_CALL_RAN;
}
