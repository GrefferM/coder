import type { OpenCalls } from "../../../../../hooks";
import type { NamedAgent, WorkingAgent } from "../../../../../../../interfaces";

export interface WorkingTurnProps {
  turn: WorkingAgent;
  /** Every agent of the project — one stream holds the turns of all of them. */
  agents: NamedAgent[];
  /** The stream's own agent, whose name and colour stand where the turn's own are not known. */
  agentName: string;
  agentColor: string;
  /** Which calls stand open — kept by the chat, so a call keeps its place when the turn is over. */
  openCalls: OpenCalls;
}
