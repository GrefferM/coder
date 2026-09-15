import type { CallOut, LinkLife, WaitingAgent, WorkingAgent } from "../../../interfaces";

/**
 * What is alive on the canvas this moment, and it is the walk of the conversation on screen —
 * another conversation's work is drawn where that conversation is read, never here.
 */
export interface CanvasLiving {
  workingAgents: WorkingAgent[];
  /** The agents holding work where lines converge. */
  waitingAgents: WaitingAgent[];
  /** How every line stands right now; one with no life is not in it. */
  linkLives: Record<string, LinkLife>;
  /** Which function each turn has out this moment, by turn; a turn calling nothing is not in it. */
  callsOut: Record<string, CallOut>;
}
