import type { NamedAgent } from "../../../../../../../../../interfaces";
import type { RunRow } from "../../../../../../../interfaces";

export interface RunRowHeadProps {
  run: RunRow;
  /** Current agents; a gone agent is named from the record. */
  agents: NamedAgent[];
  isRunning: boolean;
  /** The row or its cross is under the pointer; the hour reads brighter. */
  isRaised: boolean;
}
