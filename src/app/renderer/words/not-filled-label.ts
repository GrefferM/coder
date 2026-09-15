import { unfilledField } from "./unfilled-field";
import { NOT_FILLED_LABEL, NOT_FILLED_SEPARATOR } from "../constants";
import type { WrittenNumber } from "../interfaces";

/**
 * «НЕ ЗАПОВНЕНО» with the empty field named after it, or `null` where nothing is missing. The pill
 * on a sphere, the row of the catalogue and the picker all say it in these words.
 */
export function notFilledLabel(numbers: WrittenNumber[]): string | null {
  const unfilled = unfilledField(numbers);

  return unfilled === null ? null : `${NOT_FILLED_LABEL}${NOT_FILLED_SEPARATOR}${unfilled}`;
}
