import { agentReadiness } from "./agent-readiness";
import { agentStands } from "./agent-stands";
import { agentTools } from "./agent-tools";
import { isAgentGrant } from "../../../interfaces";
import type { Agent, GrantTargets, ProjectConfig, ProviderState, ReachableAgent } from "../../../interfaces";

/**
 * Every agent reachable as a tool from the one being asked, walked over agent grants alone and never the lines
 * of the canvas. The root is in the list too, so a sub-agent that names it back is answered with the ring it would
 * close. Each is read by the rule a person's turn is, so one that cannot run says why the moment it is called.
 */
export function agentRegistry(
  root: Agent,
  config: ProjectConfig,
  providers: ProviderState[],
  targets: GrantTargets,
): ReachableAgent[] {
  const seen = new Set<string>();
  const queue: string[] = [root.id];
  const reached: Agent[] = [];

  while (queue.length > 0) {
    const id = queue.shift() ?? "";

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);

    const agent = config.agents.find((held) => held.id === id) ?? null;

    if (agent === null) {
      continue;
    }

    reached.push(agent);

    for (const grant of agent.tools) {
      if (isAgentGrant(grant)) {
        queue.push(grant.agentId);
      }
    }
  }

  return reached.map((agent) => reachableOf(agent, config, providers, targets));
}

/** One agent's run, or why it cannot run. */
function reachableOf(
  agent: Agent,
  config: ProjectConfig,
  providers: ProviderState[],
  targets: GrantTargets,
): ReachableAgent {
  const stands = agentStands(agent, config, providers);
  const readiness = agentReadiness(agent, stands, targets);

  if ("reason" in readiness) {
    return {
      agentId: agent.id,
      name: agent.name,
      notReady: readiness.note,
    };
  }

  const { model } = readiness;

  return {
    agentId: agent.id,
    name: agent.name,
    notReady: null,
    providerId: model.provider,
    model: model.title,
    maxCalls: readiness.agent.maxCalls,
    temperature: readiness.agent.temperature,
    answerCeiling: model.answerCeiling,
    systemPrompt: stands.prompt?.text ?? null,
    tools: agentTools(agent.tools, targets),
  };
}
