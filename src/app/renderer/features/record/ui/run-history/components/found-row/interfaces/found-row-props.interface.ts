import type { NamedAgent } from "../../../../../../../interfaces";
import type { RunHit } from "../../../../../interfaces";

export interface FoundRowProps {
  /** The project's agents as they stand today, so the name on the row is looked up by id and not read. */
  agents: NamedAgent[];
  found: RunHit;
  /** The word to light inside the found words. */
  looked: string;
  onOpen: () => void;
}
