import { agentState } from "./agent-state";
import type {
  McpLook,
  ProjectConfig,
  ProviderAnswer,
  ProviderState,
  WaitingAgent,
  WorkingAgent,
} from "../../../interfaces";
import type { AgentState } from "../interfaces";

/** Which state every agent is in, worked out once, so the canvas and the panel say the same thing. */
export function agentStates(
  config: ProjectConfig,
  providers: ProviderState[],
  answers: Record<string, ProviderAnswer>,
  working: WorkingAgent[],
  waiting: WaitingAgent[],
  fellAt: Record<string, string>,
  /** What each declared server hands over right now, by server id. */
  looks: Record<string, McpLook> = {},
): Record<string, AgentState> {
  return Object.fromEntries(
    config.agents.map((agent) => [
      agent.id,
      agentState(
        agent,
        config,
        providers,
        answers,
        working.some((one) => one.agentId === agent.id),
        fellAt[agent.id] ?? null,
        waiting.some((one) => one.agentId === agent.id),
        looks,
      ),
    ]),
  );
}
