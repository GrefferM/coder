import type { AgentTool, ChatTurn, ProjectMcpServer, ReachableAgent } from "../../../contracts";

export interface ModelAsk {
  turnId: string;
  agentId: string;
  providerId: string;
  model: string;
  directory: string;
  maxCalls: number;
  temperature: number;
  answerCeiling: number;
  systemPrompt: string | null;
  messages: ChatTurn[];
  tools: AgentTool[];
  servers: ProjectMcpServer[];
  agents: ReachableAgent[];
  runId: string | null;
  questionId: string;
}
