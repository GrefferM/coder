import type { AgentTool } from "../../../../../contracts/llm";
import type { FilledAgent, FilledModel } from "../../../interfaces";

/**
 * What a turn carries to the model, once every wall before it has been passed — the agent and the model
 * with every number of theirs filled in, so nothing below has to ask about that again.
 */
export interface TurnAsked {
  agent: FilledAgent;
  model: FilledModel;
  systemPrompt: string | null;
  tools: AgentTool[];
}
