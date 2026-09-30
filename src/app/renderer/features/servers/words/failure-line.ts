import { FAILURE_MARKUP, FAILURE_MAX_CHARS } from "../../../constants";
import { plainFirstLine, shortLabel } from "../../../utils/text";

/** What a fallen server said, cut to what is worth showing; the same cut reads a provider's refusal in the chat. */
export function failureLine(failure: string): string {
  return shortLabel(plainFirstLine(failure, FAILURE_MARKUP), FAILURE_MAX_CHARS);
}
