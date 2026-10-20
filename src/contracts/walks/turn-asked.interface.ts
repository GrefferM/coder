import type { AgentTool } from "../llm";
import type { FilledAgent, FilledModel } from "../project";

/** What a turn carries to the model once every wall is passed: the agent and model with every number filled in. */
export interface TurnAsked {
  agent: FilledAgent;
  model: FilledModel;
  systemPrompt: string | null;
  tools: AgentTool[];
  /** Where the memory is compressed before the turn goes, into how many characters at most; null where it is not. */
  compression: { budget: number; at: number; to: number } | null;
}
