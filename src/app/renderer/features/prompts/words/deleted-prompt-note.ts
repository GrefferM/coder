import { ukrainianPlural } from "../../../utils/text";
import {
  DELETED_PROMPT_AGENT_FORMS,
  DELETED_PROMPT_NOTE_MANY_TAIL,
  DELETED_PROMPT_NOTE_NAMED,
  DELETED_PROMPT_NOTE_NOBODY,
  DELETED_PROMPT_NOTE_ONE_TAIL,
  DELETED_PROMPT_NOTE_PREFIX,
} from "../constants";

/**
 * «Заберемо промпт «Правки коду». 3 агенти на ньому лишаться на голій моделі.»: the prompt named, then its agents; with
 * none, it says nothing goes with it.
 */
export function deletedPromptNote(name: string, agentCount: number): string {
  const named = `${DELETED_PROMPT_NOTE_PREFIX}${name}${DELETED_PROMPT_NOTE_NAMED}`;

  if (agentCount === 0) {
    return `${named}${DELETED_PROMPT_NOTE_NOBODY}`;
  }

  const [one, few, many] = DELETED_PROMPT_AGENT_FORMS;
  const tail = agentCount === 1 ? DELETED_PROMPT_NOTE_ONE_TAIL : DELETED_PROMPT_NOTE_MANY_TAIL;

  return `${named}${agentCount} ${ukrainianPlural(agentCount, one, few, many)} ${tail}`;
}
