import type { AgentAgentTool } from "../../../contracts/llm";
import type { AgentTurnOutcome } from "./agent-turn-outcome.interface";

export interface AgentCall {
  tool: AgentAgentTool;
  request: string;
  /** The ring it would close or why the agent cannot run; `null` where it may go. */
  refusal: string | null;
  run: (signal: AbortSignal) => Promise<AgentTurnOutcome>;
}
