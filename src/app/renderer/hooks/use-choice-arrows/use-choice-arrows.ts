import { useWindowKeydown } from "../use-window-keydown";
import { CHOICE_ROW_SELECTOR, CHOICE_SELECTOR, CHOICE_STEPS } from "./constants";

/**
 * Inside a slot, the arrows.
 *
 * Tab stops once on a row of choices, and the stop is the choice already made — a row of five colours is one
 * field and not five, because the choice is one. That leaves the other four unreachable unless something inside
 * the slot moves, and what moves them is the arrows, as in every list.
 *
 * An arrow **makes** the choice rather than only pointing at it. A row of choices has no open and no close: the
 * value is whatever is pressed, so a cursor that walked without choosing would be a second state nothing on the
 * screen shows, and the person would have to press again to say what they had already said with the arrow.
 *
 * The row says it is one (`data-choice`) instead of being recognised by its shape: a list of grants and a row of
 * choices look the same from the outside — several pressables in a line, one of them marked — and they are
 * opposite things. Only a row that is one value opts in, so arrows never walk a list of roads by accident.
 */
export function useChoiceArrows(): void {
  useWindowKeydown(true, (event) => {
    const step = CHOICE_STEPS[event.key];

    if (step === undefined || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const standing = document.activeElement;

    // The arrows belong to whoever is standing on a choice: in a field being typed into they move the caret, and
    // anywhere else they are the page's or the canvas's own.
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

    // A row of one is not a choice at all, and a row that does not hold the focus is not the one being walked.
    if (at === -1 || choices.length < 2) {
      return;
    }

    event.preventDefault();

    const next = choices[(at + step + choices.length) % choices.length];

    next?.focus();
    next?.click();
  });
}
