import { CHAT_FAILED_NOTE, CHAT_FELL_SEPARATOR } from "../constants";
import { FAILURE_MARKUP, FAILURE_MAX_CHARS } from "../../../constants";
import { plainFirstLine, shortLabel } from "../../../utils/text";

/**
 * What the rule says under a turn that fell: the app's own word, and after it the provider's own sentence, so a
 * fall says why and not merely that. The words are cut by the same rule the catalogue cuts a server's by — a
 * provider that answered with a web page would otherwise bury the line that said what went wrong.
 *
 * A fall with nothing said carries the word alone: a separator with nothing after it promises a reason twice.
 */
export function fellNote(said: string): string {
  const line = shortLabel(plainFirstLine(said, FAILURE_MARKUP), FAILURE_MAX_CHARS);

  return line === "" ? CHAT_FAILED_NOTE : `${CHAT_FAILED_NOTE}${CHAT_FELL_SEPARATOR}${line}`;
}
