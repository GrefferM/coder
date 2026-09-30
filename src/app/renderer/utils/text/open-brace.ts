import { SLOT_CLOSE, SLOT_OPEN } from "./constants";
import type { OpenBrace } from "./interfaces";

/**
 * The open brace under the caret: where it opened and what was typed since; `null` if none is open. A space or closing
 * brace ends it.
 */
export function openBrace(value: string, caret: number): OpenBrace | null {
  const at = value.lastIndexOf(SLOT_OPEN, caret - 1);

  if (at < 0) {
    return null;
  }

  const typed = value.slice(at + 1, caret);

  if (typed.includes(SLOT_CLOSE) || /\s/.test(typed)) {
    return null;
  }

  return {
    at,
    typed,
  };
}
