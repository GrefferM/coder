import type { NamedAgent } from "../../../../../../../interfaces";
import type { RunRow } from "../../../../../interfaces";

export interface RunRowLineProps {
  run: RunRow;
  /** Today's agents, for the name the head wears. */
  agents: NamedAgent[];
  /** Today, as the list read it once — every row says «yesterday» against the same moment. */
  now: Date;
  onOpen: () => void;
  onForget: () => void;
}
