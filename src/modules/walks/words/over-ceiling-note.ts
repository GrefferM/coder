import {
  OVER_CEILING_CHARACTER_FORMS,
  OVER_CEILING_NOTE_DASH,
  OVER_CEILING_NOTE_MIDDLE,
  OVER_CEILING_NOTE_PREFIX,
  OVER_CEILING_NOTE_SUFFIX,
  RESERVED_NOTE_DASH,
  RESERVED_NOTE_LIMIT,
  RESERVED_NOTE_MODEL,
  RESERVED_NOTE_PREFIX,
  RESERVED_NOTE_RESERVE,
  RESERVED_NOTE_SUFFIX,
  groupedNumber,
  ukrainianPlural,
} from "../../../contracts";
import type { TurnLength } from "../../../contracts";

/**
 * What would have gone and what the model takes, in characters; the counted length is grouped, the ceiling is as the
 * person wrote it.
 */
export function overCeilingNote(modelTitle: string, length: TurnLength): string {
  const [one, few, many] = OVER_CEILING_CHARACTER_FORMS;
  const characters = ukrainianPlural(length.total, one, few, many);

  return `${OVER_CEILING_NOTE_PREFIX}${groupedNumber(length.total)} ${characters}${OVER_CEILING_NOTE_MIDDLE}${modelTitle}${OVER_CEILING_NOTE_DASH}${length.ceiling}${OVER_CEILING_NOTE_SUFFIX}`;
}

/**
 * The words of the turn, what is held back for the memory, and the threshold they must stay under, in characters; the
 * number the person wrote on the model goes out as it is.
 */
export function reservedNote(modelTitle: string, length: TurnLength, reserve: number, limit: number): string {
  const [one, few, many] = OVER_CEILING_CHARACTER_FORMS;
  const words = length.prompt + length.asked;
  const characters = ukrainianPlural(words, one, few, many);

  return `${RESERVED_NOTE_PREFIX}${groupedNumber(words)} ${characters}${RESERVED_NOTE_RESERVE}${groupedNumber(reserve)}${RESERVED_NOTE_LIMIT}${groupedNumber(limit)}${RESERVED_NOTE_MODEL}${modelTitle}${RESERVED_NOTE_DASH}${length.ceiling}${RESERVED_NOTE_SUFFIX}`;
}
