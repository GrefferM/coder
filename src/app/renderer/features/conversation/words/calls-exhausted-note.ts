import { CHAT_CALLS_EXHAUSTED_PREFIX, CHAT_CALLS_EXHAUSTED_SEPARATOR } from "../constants";

/** «ВИЧЕРПАНО МАКСИМУМ ВИКЛИКІВ · 8» — the wall the person themselves put up. */
export function callsExhaustedNote(maxCalls: number): string {
  return `${CHAT_CALLS_EXHAUSTED_PREFIX}${CHAT_CALLS_EXHAUSTED_SEPARATOR}${maxCalls}`;
}
