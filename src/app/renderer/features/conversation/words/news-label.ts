import { ukrainianPlural } from "../../../utils/text";
import { AGENT_CHAT_NEWS_FORMS } from "../constants";

/** «3 НОВІ» — how many replies came while the person was away from the end of the stream. */
export function newsLabel(news: number): string {
  return `${news} ${ukrainianPlural(news, ...AGENT_CHAT_NEWS_FORMS)}`;
}
