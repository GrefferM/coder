import type { AgentTool } from "./agent-tool.type";

/** How one agent runs: the model it asks, its two numbers, its prompt and what it may call. */
export interface AgentRun {
  providerId: string;
  model: string;
  maxCalls: number;
  temperature: number;
  answerCeiling: number;
  systemPrompt: string | null;
  tools: AgentTool[];
}
