import type { BrokenGrantGroup } from "../../tools-section/interfaces";

export interface LostGrantsProps {
  /** The broken grants by reason — a command undeclared, a function taken away, a server gone. */
  groups: BrokenGrantGroup[];
  onRemove: () => void;
}
