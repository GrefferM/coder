/**
 * What a field looks like in the page. A slot is the house's own word for one — a label with whatever takes the
 * value under it (`FieldSlot`) — and it counts as **one** stop however many things stand inside it: a row of
 * colours is a field, not five fields. A bare place to type outside any slot is a field in its own right.
 */
export const FIELD_SLOT_SELECTOR = "[data-field]";
export const TYPED_FIELD_SELECTOR = 'input:not([type="hidden"]), textarea, select';

/**
 * Inside a slot, the thing the walk actually lands on, in this order of preference: a place to type, then the
 * choice that is already made — the colour with the ring around it — and failing both, the first thing that can
 * be pressed at all. A place to type comes first because a slot's own action («ЗАКРІПИТИ») stands in its head,
 * above the value, and the head is not what the walk came for.
 */
export const FIELD_STOP_ORDER = [TYPED_FIELD_SELECTOR, '[aria-pressed="true"], [aria-checked="true"]', "button"];

/**
 * The foot of the tab — the row where the acts that end the editing stand. Unlike a slot it is not one
 * stop but all of them, because each act is its own answer and the walk must be able to reach either.
 */
export const TAB_FOOT_SELECTOR = "[data-foot]";

/**
 * Inside the foot the walk does not take the order of the page: the act that writes comes first, then whatever
 * else stands there. The eye arrives at the foot meaning to finish, and «Зберегти» is what finishing is; it is
 * drawn on the right because that is where the hand expects it, and the two orders are allowed to differ.
 */
export const TAB_FOOT_STOP_ORDER = ['[data-action="save"]', "button"];
