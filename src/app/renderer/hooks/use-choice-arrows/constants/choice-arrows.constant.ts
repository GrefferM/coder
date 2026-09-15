/**
 * A **row of choices**: one value, set by pressing one of several. It says so here rather than being guessed at,
 * because a row of choices and a list of rows look the same from the outside and are opposite things — the first
 * is a field, walked with the arrows inside it, and the second is a set of roads, each leading somewhere else.
 */
export const CHOICE_ROW_SELECTOR = "[data-choice]";
export const CHOICE_SELECTOR = "[aria-pressed], [aria-checked]";

/**
 * Which way each arrow goes. Both pairs move the same choice: a row of two words is walked left and right, a row
 * of colours is a line the eye may read either way, and nothing in the app puts a second dimension inside a slot.
 */
export const CHOICE_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowUp: -1,
  ArrowRight: 1,
  ArrowDown: 1,
};
