import { ukrainianPlural } from "../../../utils/text";
import {
  KIND_LOCK_AGENT_FORMS,
  KIND_LOCK_AGENTS_PREFIX,
  KIND_LOCK_AGENTS_SUFFIX,
  KIND_LOCK_HEARD_NOTE,
} from "../constants";

/** Why a model's kind cannot change: agents stand on it, or speech hears with it; `null` where it can. */
export function kindLockNote(agentsOnModel: number, isHeard: boolean): string | null {
  if (agentsOnModel > 0) {
    const [one, few, many] = KIND_LOCK_AGENT_FORMS;

    return `${KIND_LOCK_AGENTS_PREFIX}${agentsOnModel} ${ukrainianPlural(agentsOnModel, one, few, many)}${KIND_LOCK_AGENTS_SUFFIX}`;
  }

  return isHeard ? KIND_LOCK_HEARD_NOTE : null;
}
