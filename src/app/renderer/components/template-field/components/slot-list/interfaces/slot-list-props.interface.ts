import type { ListWalk } from "../../../../../hooks";
import type { TemplateSlot } from "../../../interfaces";

export interface SlotListProps {
  /** The declared names still matching what was typed; empty says so in a word of its own. */
  offered: TemplateSlot[];
  /** The arrows walk the names while the letters stay in the line. */
  walk: ListWalk;
  onPick: (name: string) => void;
}
