import type { AgentAgentTool } from "../../../contracts/llm";
import type { AgentTurnOutcome } from "./agent-turn-outcome.interface";

/** One call of another agent as a tool: the request the model wrote, what stops it, and the turn that answers it. */
export interface AgentCall {
  tool: AgentAgentTool;
  request: string;
  /** A ring it would close, or why the agent cannot run; nothing where it may go. */
  refusal: string | null;
  run: (signal: AbortSignal) => Promise<AgentTurnOutcome>;
}
