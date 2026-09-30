/**
 * A field in the page: a slot (`FieldSlot`, a label with its value control) counts as one stop however many things it
 * holds. A bare input outside any slot is a field itself.
 */
export const FIELD_SLOT_SELECTOR = "[data-field]";
export const TYPED_FIELD_SELECTOR = 'input:not([type="hidden"]), textarea, select';

/** What the walk lands on inside a slot, in order: a place to type, the choice already made, the first pressable. */
export const FIELD_STOP_ORDER = [TYPED_FIELD_SELECTOR, '[aria-pressed="true"], [aria-checked="true"]', "button"];

/** The foot of the tab: the row of acts that end the editing. Every act is its own stop. */
export const TAB_FOOT_SELECTOR = "[data-foot]";

/** Walk order inside the foot: the act that writes first, then the rest; it differs from the drawn order. */
export const TAB_FOOT_STOP_ORDER = ['[data-action="save"]', "button"];
