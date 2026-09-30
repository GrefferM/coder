import { serverTrouble } from "./server-trouble";
import type { McpLook } from "../../../interfaces";
import type { ServerPageDeed } from "../interfaces";

/**
 * The one process action on a server's page, taken from the state. A server missing a token or value is offered
 * nothing, nor is one being raised.
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

  // A local server is raised afresh; a remote one is only asked again.
  return isLocal ? "raiseAgain" : "askAgain";
}
