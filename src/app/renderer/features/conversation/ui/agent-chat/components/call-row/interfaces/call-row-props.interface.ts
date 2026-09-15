import type { LiveCall } from "../../../../../../../interfaces";
import type { OpenCalls } from "../../../../../hooks";

export interface CallRowProps {
  call: LiveCall;
  /** Whether this call stands open — the memory is the chat's, because the row is drawn twice. */
  openCalls: OpenCalls;
  /** The agent's own colour marks a call still out; a call that is over is grey. */
  agentColor: string;
}
