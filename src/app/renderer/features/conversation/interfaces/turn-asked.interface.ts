import type { AgentTool } from "../../../../../contracts/llm";
import type { ChatTurn, FilledAgent, FilledModel } from "../../../interfaces";

/** What a turn carries to the model once every wall is passed: the agent and model with every number filled in. */
export interface TurnAsked {
  agent: FilledAgent;
  model: FilledModel;
  systemPrompt: string | null;
  /** The agent's thread, newest pairs only, within the model's ceiling. */
  thread: ChatTurn[];
  tools: AgentTool[];
}
