import { noneAnswered } from "./none-answered";
import { serverTrouble } from "./server-trouble";
import type { McpLook } from "../../../interfaces";
import type { ServerDeed } from "../interfaces";

/**
 * The at most one action a catalogue row's head offers, chosen by state («УВІЙТИ» and «ВПИСАТИ» are one deed). A
 * working server offers none.
 */
export function serverDeed(look: McpLook | null): ServerDeed {
  const trouble = serverTrouble(look);

  if (trouble?.kind === "tokenMissing" || trouble?.kind === "valueMissing") {
    return "fill";
  }

  // A server that never rose or one that fell needs the same thing, from a person.
  if (look === null || trouble !== null) {
    return "raise";
  }

  // A server that answers and works for nobody is restarted, not started.
  return noneAnswered(look) ? "raiseAgain" : null;
}
