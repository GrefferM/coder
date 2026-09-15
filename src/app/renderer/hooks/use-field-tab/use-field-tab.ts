import { useWindowKeydown } from "../use-window-keydown";
import {
  FIELD_SLOT_SELECTOR,
  FIELD_STOP_ORDER,
  TAB_FOOT_SELECTOR,
  TAB_FOOT_STOP_ORDER,
  TYPED_FIELD_SELECTOR,
} from "./constants";

/**
 * Tab walks the fields of the open tab and nothing else. The browser's own order counts every button, and this
 * app is almost entirely buttons — walking all of them to reach the one field being filled in costs more presses
 * than the mouse it was meant to spare.
 *
 * A **field** is the house's own slot, and it is one stop however many things stand inside: a row of five colours
 * is one field, because the choice is one. A row that leads somewhere is a road and not a field at all.
 *
 * The walk goes round, so there is no falling off the end into the chrome; Shift walks it backwards, and from
 * anything that is not a field it starts at whichever end the walk is coming from.
 *
 * From the last slot it goes into the tab's foot, the act that writes first, and from there round to the first
 * field. Enter in a field writes nothing: it already means different things in a list, in the mark window and in
 * the chat, and writing a whole tab from a place that does not name the tab hides what went in.
 */
export function useFieldTab(): void {
  useWindowKeydown(true, (event) => {
    if (event.key !== "Tab" || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    // Even with no field to go to Tab stops here: the browser's order is not a fallback, it is the thing undone.
    event.preventDefault();

    const stops = fieldStops();

    stops[nextAt(stops, event.shiftKey)]?.focus();
  });
}

/** Every field of the page as one stop each, in the order they stand. */
function fieldStops(): HTMLElement[] {
  const stops: HTMLElement[] = [];
  const held = new Set<HTMLElement>();

  const marks = document.querySelectorAll<HTMLElement>(
    `${FIELD_SLOT_SELECTOR}, ${TAB_FOOT_SELECTOR}, ${TYPED_FIELD_SELECTOR}`,
  );

  for (const mark of marks) {
    for (const stop of stopsOf(mark)) {
      // A slot holds its own field, so the two meet on the same stop; whichever came first in the page keeps it.
      if (stop === null || held.has(stop) || isShut(stop)) {
        continue;
      }

      held.add(stop);
      stops.push(stop);
    }
  }

  return stops;
}

/** What one mark of the page is worth to the walk: a slot one stop, the foot all of its acts, a field itself. */
function stopsOf(mark: HTMLElement): (HTMLElement | null)[] {
  if (mark.matches(FIELD_SLOT_SELECTOR)) {
    return [stopOf(mark)];
  }

  return mark.matches(TAB_FOOT_SELECTOR) ? footStops(mark) : [mark];
}

/** The foot's acts, the one that writes first and the rest in the order they stand. */
function footStops(foot: HTMLElement): HTMLElement[] {
  const acts: HTMLElement[] = [];

  for (const wanted of TAB_FOOT_STOP_ORDER) {
    for (const act of foot.querySelectorAll<HTMLElement>(wanted)) {
      if (!acts.includes(act)) {
        acts.push(act);
      }
    }
  }

  return acts;
}

/** The one thing inside a slot the walk lands on; nothing at all where a slot has nothing to press or to type. */
function stopOf(slot: HTMLElement): HTMLElement | null {
  for (const wanted of FIELD_STOP_ORDER) {
    const stop = [...slot.querySelectorAll<HTMLElement>(wanted)].find((one) => !isShut(one));

    if (stop !== undefined) {
      return stop;
    }
  }

  return null;
}

/** A shut field is not a place to fill in either, so the walk steps over it exactly as the browser would. */
function isShut(stop: HTMLElement): boolean {
  return stop.hasAttribute("disabled");
}

/** The next field along, the walk going round; from anything that is not one, the walk starts at its end. */
function nextAt(stops: HTMLElement[], isBack: boolean): number {
  const standing = stops.indexOf(document.activeElement as HTMLElement);

  if (standing === -1) {
    return isBack ? stops.length - 1 : 0;
  }

  return (standing + (isBack ? -1 : 1) + stops.length) % stops.length;
}
