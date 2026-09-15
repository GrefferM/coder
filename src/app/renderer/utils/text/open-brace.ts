import { SLOT_CLOSE, SLOT_OPEN } from "./constants";
import type { OpenBrace } from "./interfaces";

/**
 * The brace under the caret — where it opened and what has been typed since — if the caret stands inside
 * one that is open at all. A space or a closing brace ends it, so a written-out slot offers nothing any more.
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
