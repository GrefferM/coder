import { ukrainianPlural } from "../../../utils/text";
import { AGENT_FORMS, LINK_FORMS } from "../../../constants";
import { DELETED_MODEL_LABEL } from "../constants";

/** The undo line names what came off with the model. */
export function deletedModelLabel(agents: number, links: number): string {
  const [agentOne, agentFew, agentMany] = AGENT_FORMS;
  const [linkOne, linkFew, linkMany] = LINK_FORMS;
  const parts = [
    agents === 0 ? null : `${agents} ${ukrainianPlural(agents, agentOne, agentFew, agentMany)}`,
    links === 0 ? null : `${links} ${ukrainianPlural(links, linkOne, linkFew, linkMany)}`,
  ].filter((part) => part !== null);

  return [DELETED_MODEL_LABEL, ...parts].join(" · ");
}
