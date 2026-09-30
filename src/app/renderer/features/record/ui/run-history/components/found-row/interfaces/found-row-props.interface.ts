import type { NamedAgent } from "../../../../../../../interfaces";
import type { RunHit } from "../../../../../interfaces";

export interface FoundRowProps {
  /** The project's current agents; the row's name is looked up by id. */
  agents: NamedAgent[];
  found: RunHit;
  /** The word to light inside the found words. */
  looked: string;
  onOpen: () => void;
}
