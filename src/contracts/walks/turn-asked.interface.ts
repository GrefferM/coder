import type { AgentTool } from "../llm";
import type { FilledAgent, FilledModel } from "../project";

/** What a turn carries to the model once every wall is passed: the agent and model with every number filled in. */
export interface TurnAsked {
  agent: FilledAgent;
  model: FilledModel;
  systemPrompt: string | null;
  tools: AgentTool[];
}
