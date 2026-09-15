import { groupedNumber } from "../../../utils/numbers";
import { ukrainianPlural } from "../../../utils/text";
import {
  OVER_CEILING_CHARACTER_FORMS,
  OVER_CEILING_NOTE_DASH,
  OVER_CEILING_NOTE_MIDDLE,
  OVER_CEILING_NOTE_PREFIX,
  OVER_CEILING_NOTE_SUFFIX,
} from "../constants";
import type { TurnLength } from "../interfaces";

/**
 * What would have gone and what the model takes, both in characters. What we counted is grouped; the
 * ceiling is the person's own number and stands as they wrote it.
 */
export function overCeilingNote(modelTitle: string, length: TurnLength): string {
  const [one, few, many] = OVER_CEILING_CHARACTER_FORMS;
  const characters = ukrainianPlural(length.total, one, few, many);

  return `${OVER_CEILING_NOTE_PREFIX}${groupedNumber(length.total)} ${characters}${OVER_CEILING_NOTE_MIDDLE}${modelTitle}${OVER_CEILING_NOTE_DASH}${length.ceiling}${OVER_CEILING_NOTE_SUFFIX}`;
}
