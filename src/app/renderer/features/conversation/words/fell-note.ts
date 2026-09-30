import { CHAT_FAILED_NOTE, CHAT_FELL_SEPARATOR } from "../constants";
import { FAILURE_MARKUP, FAILURE_MAX_CHARS } from "../../../constants";
import { plainFirstLine, shortLabel } from "../../../utils/text";

/**
 * The rule's text under a turn that fell: the app's word, then the provider's sentence, cut by the same rule as a
 * server's; a fall with nothing said carries the word alone.
 */
export function fellNote(said: string): string {
  const line = shortLabel(plainFirstLine(said, FAILURE_MARKUP), FAILURE_MAX_CHARS);

  return line === "" ? CHAT_FAILED_NOTE : `${CHAT_FAILED_NOTE}${CHAT_FELL_SEPARATOR}${line}`;
}
