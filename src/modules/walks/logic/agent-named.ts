import {
  AGENT_ASK_KNOWN_LABEL,
  AGENT_ASK_NAME_SEPARATOR,
  AGENT_ASK_NONE_NOTE,
  AGENT_ASK_NO_AGENTS_NOTE,
  AGENT_ASK_SEVERAL_NOTE,
} from "../constants";
import type { Agent } from "../../../contracts";

/** The agent a command line named, by id or by name (case aside); rejects in words the person can act on. */
export function agentNamed(agents: Agent[], wanted: string): Agent {
  const byId = agents.find((agent) => agent.id === wanted);

  if (byId !== undefined) {
    return byId;
  }

  const same = agents.filter((agent) => agent.name.trim().toLowerCase() === wanted.trim().toLowerCase());

  if (same.length === 1) {
    return same[0];
  }

  if (same.length > 1) {
    throw new Error(`${AGENT_ASK_SEVERAL_NOTE}${same.map((agent) => agent.id).join(AGENT_ASK_NAME_SEPARATOR)}`);
  }

  const known =
    agents.length === 0
      ? AGENT_ASK_NO_AGENTS_NOTE
      : `${AGENT_ASK_KNOWN_LABEL}${agents.map((agent) => agent.name).join(AGENT_ASK_NAME_SEPARATOR)}`;

  throw new Error(`${AGENT_ASK_NONE_NOTE}${wanted}. ${known}`);
}
