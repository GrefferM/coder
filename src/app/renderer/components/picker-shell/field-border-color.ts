import { FIELD_INVALID_BORDER_COLOR } from "../field/constants";
import { FIELD_SLOT_CHANGED_BORDER_COLOR } from "../field-slot/constants";
import { PICKER_BORDER_COLOR, PICKER_OPEN_BORDER_COLOR } from "./constants";

/**
 * The colour of a picker's field, by what is true of it. The order is the rule: open first, because a list
 * standing over the field is what the person is doing right now; then invalid, because a wrong value is worth
 * saying over an unsaved one; then changed; and the resting colour where none of the three holds.
 */
export function fieldBorderColor(isOpen: boolean, isInvalid: boolean, isChanged: boolean): string {
  if (isOpen) {
    return PICKER_OPEN_BORDER_COLOR;
  }

  if (isInvalid) {
    return FIELD_INVALID_BORDER_COLOR;
  }

  return isChanged ? FIELD_SLOT_CHANGED_BORDER_COLOR : PICKER_BORDER_COLOR;
}
