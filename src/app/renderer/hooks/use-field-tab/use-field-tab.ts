import { useWindowKeydown } from "../use-window-keydown";
import {
  FIELD_SLOT_SELECTOR,
  FIELD_STOP_ORDER,
  TAB_FOOT_SELECTOR,
  TAB_FOOT_STOP_ORDER,
  TYPED_FIELD_SELECTOR,
} from "./constants";

/**
 * Tab walks the fields of the open tab only.
 *
 * A field is a slot and one stop however many things stand inside; a row that leads somewhere is not a field. The walk
 * goes round, Shift reverses it, and from a non-field it starts at the end it is coming from. From the last slot it
 * enters the tab's foot, the act that writes first, then returns to the first field. Enter in a field writes nothing.
 */
export function useFieldTab(): void {
  useWindowKeydown(true, (event) => {
    if (event.key !== "Tab" || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    // Tab stops here even with no field to go to; the browser's order is not a fallback.
    event.preventDefault();

    const stops = fieldStops();

    stops[nextAt(stops, event.shiftKey)]?.focus();
  });
}

/** Every field of the page, one stop each, in page order. */
function fieldStops(): HTMLElement[] {
  const stops: HTMLElement[] = [];
  const held = new Set<HTMLElement>();

  const marks = document.querySelectorAll<HTMLElement>(
    `${FIELD_SLOT_SELECTOR}, ${TAB_FOOT_SELECTOR}, ${TYPED_FIELD_SELECTOR}`,
  );

  for (const mark of marks) {
    for (const stop of stopsOf(mark)) {
      // A slot holds its own field, so both meet on one stop; the first in page order keeps it.
      if (stop === null || held.has(stop) || isShut(stop)) {
        continue;
      }

      held.add(stop);
      stops.push(stop);
    }
  }

  return stops;
}

/** A mark's stops: a slot one, the foot all its acts, a field itself. */
function stopsOf(mark: HTMLElement): (HTMLElement | null)[] {
  if (mark.matches(FIELD_SLOT_SELECTOR)) {
    return [stopOf(mark)];
  }

  return mark.matches(TAB_FOOT_SELECTOR) ? footStops(mark) : [mark];
}

/** The foot's acts: the one that writes first, then the rest in page order. */
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

/** The one thing in a slot the walk lands on; null where nothing can be pressed or typed. */
function stopOf(slot: HTMLElement): HTMLElement | null {
  for (const wanted of FIELD_STOP_ORDER) {
    const stop = [...slot.querySelectorAll<HTMLElement>(wanted)].find((one) => !isShut(one));

    if (stop !== undefined) {
      return stop;
    }
  }

  return null;
}

/** A shut field is stepped over, as the browser would. */
function isShut(stop: HTMLElement): boolean {
  return stop.hasAttribute("disabled");
}

/** The next field along, round the ends; from a non-field, the walk's end. */
function nextAt(stops: HTMLElement[], isBack: boolean): number {
  const standing = stops.indexOf(document.activeElement as HTMLElement);

  if (standing === -1) {
    return isBack ? stops.length - 1 : 0;
  }

  return (standing + (isBack ? -1 : 1) + stops.length) % stops.length;
}
