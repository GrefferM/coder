import { CHAT_CALLS_EXHAUSTED_PREFIX, CHAT_CALLS_EXHAUSTED_SEPARATOR } from "./chat-notes.constant";

/** «ВИЧЕРПАНО МАКСИМУМ ВИКЛИКІВ · 8»: the limit the person set. */
export function callsExhaustedNote(maxCalls: number): string {
  return `${CHAT_CALLS_EXHAUSTED_PREFIX}${CHAT_CALLS_EXHAUSTED_SEPARATOR}${maxCalls}`;
}
