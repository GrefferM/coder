import { SERVER_NONE_ANSWERED_AFTER } from "../constants";
import type { McpLook } from "../../../interfaces";

/**
 * A server that answers and works for nobody: three calls failed in a row and none has worked since it connected. A
 * fallen server is not this: its connection is gone and the row says «ПРОЦЕС УПАВ».
 */
export function noneAnswered(look: McpLook | null): boolean {
  if (look === null || !look.isUp) {
    return false;
  }

  return !look.calls.hasWorked && look.calls.failedInARow >= SERVER_NONE_ANSWERED_AFTER;
}
