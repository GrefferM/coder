/**
 * A row of choices: one value set by pressing one of several. It opts in explicitly, since it looks like a list of rows
 * that each lead elsewhere.
 */
export const CHOICE_ROW_SELECTOR = "[data-choice]";
export const CHOICE_SELECTOR = "[aria-pressed], [aria-checked]";

/** Which way each arrow goes; both pairs move the same choice. */
export const CHOICE_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowUp: -1,
  ArrowRight: 1,
  ArrowDown: 1,
};
