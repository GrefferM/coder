import { ukrainianPlural } from "../../../utils/text";
import {
  DELETED_AGENT_SCHEDULE_COUNT_WORDS,
  DELETED_AGENT_SCHEDULE_FORMS,
  DELETED_AGENT_SCHEDULE_HER,
  DELETED_AGENT_SCHEDULE_TAIL,
  DELETED_AGENT_SCHEDULE_VERB_FORMS,
} from "../constants";

/** «Два її розклади лишаться без агента.»; empty for an agent with none. */
export function agentSchedulesNote(count: number): string {
  if (count === 0) {
    return "";
  }

  const [one, few, many] = DELETED_AGENT_SCHEDULE_FORMS;
  const [goesOne, goesFew, goesMany] = DELETED_AGENT_SCHEDULE_VERB_FORMS;
  const said = DELETED_AGENT_SCHEDULE_COUNT_WORDS[count - 1] ?? String(count);
  const schedules = ukrainianPlural(count, one, few, many);
  const stay = ukrainianPlural(count, goesOne, goesFew, goesMany);

  return `${said} ${DELETED_AGENT_SCHEDULE_HER} ${schedules} ${stay} ${DELETED_AGENT_SCHEDULE_TAIL}`;
}
