import { ukrainianPlural } from "../../../utils/text";
import { SERVER_CALL_FELL_FORMS, SERVER_NONE_ANSWERED_NOTE_TAIL } from "../constants";

/**
 * The sentence under the facts of a server that works for nobody — «Три виклики поспіль упали, вдалого
 * не було жодного з підключення. Каталог сервер віддав, роботу — ні.» The row says the number the calls
 * actually came to, which is three or more.
 */
export function noneAnsweredNote(failedInARow: number): string {
  const [one, few, many] = SERVER_CALL_FELL_FORMS;

  return `${failedInARow} ${ukrainianPlural(failedInARow, one, few, many)}${SERVER_NONE_ANSWERED_NOTE_TAIL}`;
}
