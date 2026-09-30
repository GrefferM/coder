import { FIELD_INVALID_BORDER_COLOR } from "../field/constants";
import { FIELD_SLOT_CHANGED_BORDER_COLOR } from "../field-slot/constants";
import { PICKER_BORDER_COLOR, PICKER_OPEN_BORDER_COLOR } from "./constants";

/** A picker field's colour by state, in priority order: open, invalid, changed, then resting. */
export function fieldBorderColor(isOpen: boolean, isInvalid: boolean, isChanged: boolean): string {
  if (isOpen) {
    return PICKER_OPEN_BORDER_COLOR;
  }

  if (isInvalid) {
    return FIELD_INVALID_BORDER_COLOR;
  }

  return isChanged ? FIELD_SLOT_CHANGED_BORDER_COLOR : PICKER_BORDER_COLOR;
}
