import { ukrainianPlural } from "../../../utils/text";
import {
  DELETED_MODEL_NOTE_AGENT_FORMS,
  DELETED_MODEL_NOTE_MIDDLE,
  DELETED_MODEL_NOTE_PREFIX,
  DELETED_MODEL_NOTE_SUFFIX,
} from "../constants";

/** What the question takes: the model and the agents dimmed behind it. */
export function deletedModelNote(title: string, agents: number): string {
  const [one, few, many] = DELETED_MODEL_NOTE_AGENT_FORMS;

  return `${DELETED_MODEL_NOTE_PREFIX}${title}${DELETED_MODEL_NOTE_MIDDLE}${agents} ${ukrainianPlural(
    agents,
    one,
    few,
    many,
  )}${DELETED_MODEL_NOTE_SUFFIX}`;
}
