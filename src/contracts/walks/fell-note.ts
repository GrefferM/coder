import { CHAT_FAILED_NOTE, CHAT_FELL_SEPARATOR } from "./chat-notes.constant";
import { FAILURE_MARKUP } from "../text/failure-words.constant";
import { plainFirstLine } from "../text/plain-first-line";

/**
 * The rule's text under a turn that fell: the app's word, then the provider's whole sentence on one line, stopping at
 * markup; a fall with nothing said carries the word alone.
 */
export function fellNote(said: string): string {
  const line = plainFirstLine(said, FAILURE_MARKUP);

  return line === "" ? CHAT_FAILED_NOTE : `${CHAT_FAILED_NOTE}${CHAT_FELL_SEPARATOR}${line}`;
}
