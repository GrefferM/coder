import type { McpCallsState } from "./mcp-calls-state.interface";
import type { McpFunction } from "./mcp-function.interface";

/** One look at a server. Nothing here is in any file: it is what the server said this time. */
export interface McpLook {
  serverId: string;
  isUp: boolean;
  /** Empty for a server that did not answer — never a guess from last time. */
  functions: McpFunction[];
  answeredAt: number | null;
  /** Why it did not answer, in the words it failed with. */
  failure: string | null;
  /** When this machine last saw the list differ. Kept beside the record of runs, not in the project file. */
  changedAt: number | null;
  /** How many functions there were before that change — «34 → 33». */
  wasCount: number | null;
  calls: McpCallsState;
}
