import { CHAT_FAILED_NOTE, CHAT_FELL_SEPARATOR } from "../constants";
import { FAILURE_MARKUP } from "../../../constants";
import { plainFirstLine } from "../../../utils/text";

/**
 * The rule's text under a turn that fell: the app's word, then the provider's whole sentence on one line, stopping at
 * markup; a fall with nothing said carries the word alone.
 */
export function fellNote(said: string): string {
  const line = plainFirstLine(said, FAILURE_MARKUP);

  return line === "" ? CHAT_FAILED_NOTE : `${CHAT_FAILED_NOTE}${CHAT_FELL_SEPARATOR}${line}`;
}
