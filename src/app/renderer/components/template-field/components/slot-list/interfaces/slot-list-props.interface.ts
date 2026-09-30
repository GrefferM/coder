import type { ListWalk } from "../../../../../hooks";
import type { TemplateSlot } from "../../../interfaces";

export interface SlotListProps {
  /** Declared names still matching the typed text; empty shows a word saying so. */
  offered: TemplateSlot[];
  /** Arrows walk the names while letters stay in the line. */
  walk: ListWalk;
  onPick: (name: string) => void;
}
