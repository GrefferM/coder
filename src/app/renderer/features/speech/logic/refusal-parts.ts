import { REFUSAL_SAID_SEPARATOR } from "../../../../../contracts";
import type { RefusalParts } from "../interfaces";

/** A refusal's message taken apart: its code, and what it said beside it; empty where it said nothing. */
export function refusalParts(message: string): RefusalParts {
  const at = message.indexOf(REFUSAL_SAID_SEPARATOR);

  if (at === -1) {
    return {
      code: message,
      said: "",
    };
  }

  return {
    code: message.slice(0, at),
    said: message.slice(at + REFUSAL_SAID_SEPARATOR.length),
  };
}
