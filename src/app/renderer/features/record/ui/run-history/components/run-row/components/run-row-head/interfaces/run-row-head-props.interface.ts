import type { NamedAgent } from "../../../../../../../../../interfaces";
import type { RunRow } from "../../../../../../../interfaces";

export interface RunRowHeadProps {
  run: RunRow;
  /** Today's agents, so the name is fresh and an agent that is gone is named from the record. */
  agents: NamedAgent[];
  isRunning: boolean;
  /** The row or its cross is under the pointer — one word covers both, and the hour reads brighter. */
  isRaised: boolean;
}
