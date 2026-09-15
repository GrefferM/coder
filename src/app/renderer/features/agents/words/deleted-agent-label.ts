import { ukrainianPlural } from "../../../utils/text";
import { LINK_FORMS } from "../../../constants";
import { DELETED_AGENT_LABEL, DELETED_LINKS_SUFFIX } from "../constants";

/** The undo line after a deletion: what went, and how many links went with it — The words. */
export function deletedAgentLabel(removedLinks: number): string {
  if (removedLinks === 0) {
    return DELETED_AGENT_LABEL;
  }

  const [one, few, many] = LINK_FORMS;
  const form = ukrainianPlural(removedLinks, one, few, many);

  return `${DELETED_AGENT_LABEL} · ${removedLinks} ${form} ${DELETED_LINKS_SUFFIX}`;
}
