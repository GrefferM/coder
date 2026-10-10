import { unfilledField } from "../../../contracts/project";
import { NOT_FILLED_LABEL, NOT_FILLED_SEPARATOR } from "../constants";
import type { WrittenNumber } from "../interfaces";

/** «НЕ ЗАПОВНЕНО» followed by the empty field's name, or `null` when nothing is missing. */
export function notFilledLabel(numbers: WrittenNumber[]): string | null {
  const unfilled = unfilledField(numbers);

  return unfilled === null ? null : `${NOT_FILLED_LABEL}${NOT_FILLED_SEPARATOR}${unfilled}`;
}
