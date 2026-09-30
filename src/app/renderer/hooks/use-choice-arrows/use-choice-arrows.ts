import { useWindowKeydown } from "../use-window-keydown";
import { CHOICE_ROW_SELECTOR, CHOICE_SELECTOR, CHOICE_STEPS } from "./constants";

/**
 * Arrows inside a slot of choices: Tab stops once on the row, the arrows move between choices and make the choice. A
 * row opts in with `data-choice`, so arrows never walk a list of grants.
 */
export function useChoiceArrows(): void {
  useWindowKeydown(true, (event) => {
    const step = CHOICE_STEPS[event.key];

    if (step === undefined || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const standing = document.activeElement;

    // Arrows belong to whoever stands on a choice: in a text field they move the caret, elsewhere they are the page's
    // or canvas's.
    if (!(standing instanceof HTMLElement) || !standing.matches(CHOICE_SELECTOR)) {
      return;
    }

    const row = standing.closest(CHOICE_ROW_SELECTOR);

    if (row === null) {
      return;
    }

    const choices = [...row.querySelectorAll<HTMLElement>(CHOICE_SELECTOR)].filter(
      (choice) => !choice.hasAttribute("disabled"),
    );
    const at = choices.indexOf(standing);

    // A row of one is not a choice, and a row without the focus is not being walked.
    if (at === -1 || choices.length < 2) {
      return;
    }

    event.preventDefault();

    const next = choices[(at + step + choices.length) % choices.length];

    next?.focus();
    next?.click();
  });
}
