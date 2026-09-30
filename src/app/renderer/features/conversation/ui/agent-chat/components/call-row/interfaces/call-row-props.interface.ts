import type { LiveCall } from "../../../../../../../interfaces";
import type { OpenCalls } from "../../../../../hooks";

export interface CallRowProps {
  call: LiveCall;
  /** Whether the call is open; the chat holds it because the row is drawn twice. */
  openCalls: OpenCalls;
  /** Marks a call still out; a finished call is grey. */
  agentColor: string;
}
