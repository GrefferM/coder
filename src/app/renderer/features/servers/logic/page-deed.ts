import { serverTrouble } from "./server-trouble";
import type { McpLook } from "../../../interfaces";
import type { ServerPageDeed } from "../interfaces";

/**
 * The one action about the process on a server's page, and the word it takes from the state.
 *
 * A server missing a token or a value is offered nothing here: no doing with the process mends a hole, and the
 * door that does is «Змінити» in the foot. A server being raised is offered nothing either — it is already
 * happening, and «СКАСУВАТИ» belongs to the row that is waiting.
 */
export function pageDeed(look: McpLook | null, isLocal: boolean, isAsking: boolean): ServerPageDeed {
  if (isAsking) {
    return null;
  }

  const trouble = serverTrouble(look);

  if (trouble?.kind === "tokenMissing" || trouble?.kind === "valueMissing") {
    return null;
  }

  if (look === null || trouble !== null) {
    return "raise";
  }

  // A local server is our own process — put down and raised; a remote one is a connection, and is only asked again.
  return isLocal ? "raiseAgain" : "askAgain";
}
