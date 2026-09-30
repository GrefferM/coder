import type { McpCallsState } from "./mcp-calls-state.interface";
import type { McpFunction } from "./mcp-function.interface";

/** One look at a server: what it said this time; nothing is stored. */
export interface McpLook {
  serverId: string;
  isUp: boolean;
  /** Empty when the server did not answer; never a guess from earlier. */
  functions: McpFunction[];
  answeredAt: number | null;
  /** Why it did not answer, in the words it failed with. */
  failure: string | null;
  /** When this machine last saw the list differ; kept beside the run record, not in the project file. */
  changedAt: number | null;
  /** The function count before that change: «34 → 33». */
  wasCount: number | null;
  calls: McpCallsState;
}
