import { NOTHING_FOUND_MIDDLE, NOTHING_FOUND_PREFIX, NOTHING_FOUND_SUFFIX } from "../constants";

/**
 * What the list says where the word is in nothing. Not «Історія порожня» — the record is right
 * there; it is this word that is in none of it, and the sentence says exactly that, with the word inside it. The
 * field is a step above, but a long query shows only its tail there, and the tail is not what was looked for.
 */
export function nothingFoundNote(query: string): string {
  return `${NOTHING_FOUND_PREFIX}${query}${NOTHING_FOUND_MIDDLE}${NOTHING_FOUND_SUFFIX}`;
}
