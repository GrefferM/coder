import { ukrainianPlural } from "../../../utils/text";
import { FOUND_CEILING_WORD, FOUND_COUNT_SEPARATOR, FOUND_PLACE_FORMS, FOUND_RUN_FORMS } from "../constants";
import { RUN_HITS_LIMIT } from "../../../../../contracts";

/**
 * The count inside the search field: «142» at rest, «40 МІСЦЬ · 3 ЗАПУСКИ» with a word. At the limit the second half is
 * a word, as counting stopped; where nothing is found it is the record: «0 МІСЦЬ · 142 ЗАПУСКИ».
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
