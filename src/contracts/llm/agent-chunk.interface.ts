import type { LiveCall } from "./live-call.interface";

/** One piece of an answer as it arrives; `call` carries a call that just started or just ended. */
export interface AgentChunk {
  turnId: string;
  text: string;
  call: LiveCall | null;
}
