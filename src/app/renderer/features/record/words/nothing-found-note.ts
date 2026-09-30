import { NOTHING_FOUND_MIDDLE, NOTHING_FOUND_PREFIX, NOTHING_FOUND_SUFFIX } from "../constants";

/**
 * What the list says when the word is in nothing, with the word inside it; not «Історія порожня», since the record
 * exists.
 */
export function nothingFoundNote(query: string): string {
  return `${NOTHING_FOUND_PREFIX}${query}${NOTHING_FOUND_MIDDLE}${NOTHING_FOUND_SUFFIX}`;
}
