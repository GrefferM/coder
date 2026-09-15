import { ukrainianPlural } from "../../../utils/text";
import { FOUND_CEILING_WORD, FOUND_COUNT_SEPARATOR, FOUND_PLACE_FORMS, FOUND_RUN_FORMS } from "../constants";
import { RUN_HITS_LIMIT } from "../../../../../contracts";

/**
 * The number inside the search field. With nothing typed it is the record itself — «142», one number and
 * no words. With a word typed it says what was found: «40 МІСЦЬ · 3 ЗАПУСКИ», the places first because places are
 * what the list now holds, the runs second because they say how far apart those places lie.
 *
 * At the ceiling the second half is not a count: counting stopped, so the field says so with a word rather than a
 * number that would be a lie. Where nothing was found the second half is the record instead of a nought — «0 МІСЦЬ ·
 * 142 ЗАПУСКИ» — because the reader needs to know the record is there and the word is not in it.
 */
export function foundCount(query: string, places: number, runs: number, record: number): string {
  if (query.trim() === "") {
    return `${record}`;
  }

  const said = `${places} ${ukrainianPlural(places, ...FOUND_PLACE_FORMS)}`;

  if (places >= RUN_HITS_LIMIT) {
    return `${said}${FOUND_COUNT_SEPARATOR}${FOUND_CEILING_WORD}`;
  }

  const among = places === 0 ? record : runs;

  return `${said}${FOUND_COUNT_SEPARATOR}${among} ${ukrainianPlural(among, ...FOUND_RUN_FORMS)}`;
}
