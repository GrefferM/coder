import { BROKEN_PLACE_UNKNOWN } from "../constants";
import type { ValidationError } from "class-validator";

/**
 * Where a project file first goes wrong, as a path a person can follow with their eyes: `agents[1].tools[7].id`.
 *
 * The validator answers with a tree, and only its leaves say what is actually wrong — a branch above one merely
 * says that something under it is. So the walk goes down the first failing branch to the first leaf, and names
 * the whole way there. One place is enough: a file is opened or it is not, and the first wrong field stops it.
 */
export function brokenPlace(errors: ValidationError[]): string {
  const [first] = errors;

  if (first === undefined) {
    return BROKEN_PLACE_UNKNOWN;
  }

  const under = brokenPlace(first.children ?? []);
  const here = Number.isNaN(Number(first.property)) ? first.property : `[${first.property}]`;

  if (under === BROKEN_PLACE_UNKNOWN) {
    return here;
  }

  // A row of a list is named by its number in brackets, and hangs on the name above it with no dot between.
  return under.startsWith("[") ? `${here}${under}` : `${here}.${under}`;
}
