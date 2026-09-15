import { ukrainianPlural } from "../../../utils/text";
import { AGENT_FORMS } from "../../../constants";
import { DELETED_PROMPT_LABEL, DELETED_PROMPT_LEFT_SUFFIX } from "../constants";

/** The undo line names the agents the prompt came off. */
export function deletedPromptLabel(agents: number): string {
  if (agents === 0) {
    return DELETED_PROMPT_LABEL;
  }

  const [one, few, many] = AGENT_FORMS;

  return `${DELETED_PROMPT_LABEL} · ${agents} ${ukrainianPlural(agents, one, few, many)} ${DELETED_PROMPT_LEFT_SUFFIX}`;
}
