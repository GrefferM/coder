import {
  BROKEN_PLACE_FIELD_PREFIX,
  BROKEN_PLACE_FIELD_SUFFIX,
  BROKEN_PLACE_FIELD_WORDS,
  BROKEN_PLACE_KIND_WORDS,
  BROKEN_PLACE_NAME_CLOSE,
  BROKEN_PLACE_NAME_OPEN,
  BROKEN_PLACE_PROJECT_WORD,
  BROKEN_PLACE_RULE_DEFAULT,
  BROKEN_PLACE_RULE_PHRASES,
  BROKEN_PLACE_STEP_SEPARATOR,
} from "../constants";
import type { BrokenPlace, BrokenStep } from "../../../interfaces";

/**
 * The broken place as a line a person can act on: the named things down to the wrong field, then the field and
 * what is wrong with it — «Команда «fetch» → параметр «url»: поле «ідентифікатор» — має бути коректним…».
 */
export function brokenPlaceNote(place: BrokenPlace): string {
  const things = place.trail.length === 0 ? BROKEN_PLACE_PROJECT_WORD : capitalized(trailWords(place.trail));
  const field = BROKEN_PLACE_FIELD_WORDS[place.field] ?? place.field;
  const rule = BROKEN_PLACE_RULE_PHRASES[place.rule] ?? BROKEN_PLACE_RULE_DEFAULT;

  return `${things}${BROKEN_PLACE_FIELD_PREFIX}${field}${BROKEN_PLACE_FIELD_SUFFIX}${rule}`;
}

/** The named things in order, each its kind and its own name where it has one. */
function trailWords(trail: BrokenStep[]): string {
  return trail
    .map((step) => {
      const kind = BROKEN_PLACE_KIND_WORDS[step.kind];

      return step.name === null ? kind : `${kind}${BROKEN_PLACE_NAME_OPEN}${step.name}${BROKEN_PLACE_NAME_CLOSE}`;
    })
    .join(BROKEN_PLACE_STEP_SEPARATOR);
}

/** The line opens with a capital, whichever word stands first. */
function capitalized(line: string): string {
  return `${line.charAt(0).toUpperCase()}${line.slice(1)}`;
}
