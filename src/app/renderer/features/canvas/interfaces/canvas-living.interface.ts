import type { CallOut, LinkLife, WaitingAgent, WorkingAgent } from "../../../interfaces";

/** What is alive on the canvas now: the walk of the conversation on screen only. */
export interface CanvasLiving {
  workingAgents: WorkingAgent[];
  /** The agents holding work where lines converge. */
  waitingAgents: WaitingAgent[];
  /** How each line stands now; a line with no life is absent. */
  linkLives: Record<string, LinkLife>;
  /** The function each turn has out, by turn; a turn calling nothing is absent. */
  callsOut: Record<string, CallOut>;
}
