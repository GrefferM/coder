import { SERVER_NONE_ANSWERED_AFTER } from "../constants";
import type { McpLook } from "../../../interfaces";

/**
 * A server that answers and works for nobody — three calls failed one after another and not one has
 * worked since it connected. «Каталог сервер віддав, роботу — ні»: the catalogue cannot see this, and the calls can.
 *
 * A server that fell is not this: there the connection is gone, and the row says «ПРОЦЕС УПАВ» instead.
 */
export function noneAnswered(look: McpLook | null): boolean {
  if (look === null || !look.isUp) {
    return false;
  }

  return !look.calls.hasWorked && look.calls.failedInARow >= SERVER_NONE_ANSWERED_AFTER;
}
