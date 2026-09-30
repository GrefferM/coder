import type { OpenCalls } from "../../../../../hooks";
import type { NamedAgent, WorkingAgent } from "../../../../../../../interfaces";

export interface WorkingTurnProps {
  turn: WorkingAgent;
  /** Every agent of the project; one stream holds all their turns. */
  agents: NamedAgent[];
  /** The stream's agent, whose name and colour apply where the turn's own are unknown. */
  agentName: string;
  agentColor: string;
  /** Which calls are open; kept by the chat so a call keeps its place after the turn ends. */
  openCalls: OpenCalls;
}
