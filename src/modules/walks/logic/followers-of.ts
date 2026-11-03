import { linkOuts } from "./link-outs";
import type { Agent, ProjectConfig, RouteFollower } from "../../../contracts";

/** Whom this agent's answer may be handed to: the agents its lines lead to that can take work, in line order. */
export function followersOf(config: ProjectConfig, agent: Agent): RouteFollower[] {
  return linkOuts(config, agent)
    .filter((out) => out.stopReason === null)
    .map((out) => ({
      agentId: out.to.id,
      name: out.to.name,
      purpose: out.to.purpose,
    }));
}
