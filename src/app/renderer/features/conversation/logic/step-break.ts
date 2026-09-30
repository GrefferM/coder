import { CHAT_STEP_BROKEN_NOTE } from "../constants";
import type { ChatMessage } from "../interfaces";

/**
 * Whether the app speaks at this turn: a broken step says its word once, at the last of the turns that broke together
 * in one walk; a repeat says its own.
 */
export function saysBreak(messages: ChatMessage[], at: number): boolean {
  const next = messages[at + 1];

  return !(
    next !== undefined &&
    next.note !== null &&
    next.text === "" &&
    messages[at].text === "" &&
    sameWalk(messages[at], next)
  );
}

/** Two turns of one walk; a turn naming no walk stands alone. */
function sameWalk(one: ChatMessage, other: ChatMessage): boolean {
  return one.walkId !== null && one.walkId === other.walkId;
}

/** The word a broken step says: the shared end where all agree, the general word where they differ. */
export function breakWords(messages: ChatMessage[], at: number): string | null {
  const broke = [messages[at]];

  for (let over = at - 1; over >= 0; over -= 1) {
    if (
      messages[over].note === null ||
      messages[over].text !== "" ||
      messages[over + 1].text !== "" ||
      !sameWalk(messages[over], messages[over + 1])
    ) {
      break;
    }

    broke.unshift(messages[over]);
  }

  return broke.every((one) => one.note === messages[at].note) ? messages[at].note : CHAT_STEP_BROKEN_NOTE;
}
