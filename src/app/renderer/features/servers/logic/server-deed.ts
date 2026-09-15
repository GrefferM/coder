import { noneAnswered } from "./none-answered";
import { serverTrouble } from "./server-trouble";
import type { McpLook } from "../../../interfaces";
import type { ServerDeed } from "../interfaces";

/**
 * The head of a catalogue row holds **at most one action** — the one the state asks for. This says
 * which, and the row alone knows the words for it: «УВІЙТИ» and «ВПИСАТИ» are the same deed with two different
 * holes to fill.
 *
 * A server that stands answering asks for nothing here. What there is to do with a living process — raise it
 * afresh, or ask it again — belongs to its page, because it is about the process and not about the state.
 */
export function serverDeed(look: McpLook | null): ServerDeed {
  const trouble = serverTrouble(look);

  if (trouble?.kind === "tokenMissing" || trouble?.kind === "valueMissing") {
    return "fill";
  }

  // One that never rose and one that fell both ask for the same thing, and they ask it of a hand.
  if (look === null || trouble !== null) {
    return "raise";
  }

  // A server that answers and works for nobody is restarted, not started — it never fell.
  return noneAnswered(look) ? "raiseAgain" : null;
}
