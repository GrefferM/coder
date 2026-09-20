import { FAILURE_MARKUP, FAILURE_MAX_CHARS } from "../../../constants";
import { plainFirstLine, shortLabel } from "../../../utils/text";

/**
 * What a fallen server said, as much of it as is worth showing: a row that says a server fell and not why is a
 * dead end. Its own words, though, and not its own web page — and the cut is the app's own rule, so a
 * provider's refusal in the chat is read the same way.
 */
export function failureLine(failure: string): string {
  return shortLabel(plainFirstLine(failure, FAILURE_MARKUP), FAILURE_MAX_CHARS);
}
