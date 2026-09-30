import type { BrokenGrantGroup } from "../../tools-section/interfaces";

export interface LostGrantsProps {
  /** Broken grants by reason: undeclared command, removed function, gone server. */
  groups: BrokenGrantGroup[];
  onRemove: () => void;
}
